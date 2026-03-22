
import crypto from "node:crypto";
import { env } from "@lib/utils";
import { Response, Request } from "express";
import * as responses from "@lib/responses";
import z from "zod";
import { dayjs } from "@lib/utils";
import * as errors from "@lib/errors";
import * as auth from "@src/auth";
import * as types from "@lib/types";
import { type SetUpPayloadParams } from "@src/auth";
import { nanoid } from "nanoid";
import logger from "@lib/logger";

async function hashRaw(raw: string){
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const buffer = new Uint8Array(
        await crypto.subtle.digest(env("RT_CREATE_REQUEST_HASH_FUNC"), data)
    );
    
    // hash
    return Buffer.from(buffer).toString(env("RT_CREATE_REQUEST_ENCODING"));
};

interface ValidateCreateRequestParams {
    req: Request
    redis: types.AppContext["dataSources"]["redis"]
    rkPrefix: "rt" | "at"
    bodySchema: z.ZodObject
}

async function validateCreateRequest<ResponseBodyType>(
    { req, redis, rkPrefix, bodySchema }: ValidateCreateRequestParams
): Promise<ResponseBodyType> {
    const headersSchema = z.object(
        {
            "x-timestamp": z.coerce.number(),
            "x-nonce": z.string(),
            "x-body-hash": z.string(),
            "x-signature": z.string()
        }
    );
    const parsedHeaders = headersSchema.safeParse(req.headers);

    if (!parsedHeaders.success) throw new errors.TokenRequestValidationError(rkPrefix);

    const parsedBody = bodySchema.safeParse(req.body);

    if (!parsedBody.success) throw new errors.TokenRequestValidationError(rkPrefix);

    const reqMethod = req.method;
    const reqPath = req.baseUrl + req.path;
    const reqTimestamp = parsedHeaders.data["x-timestamp"]!;
    const reqNonce = parsedHeaders.data["x-nonce"]!;
    const reqHashedBody = parsedHeaders.data["x-body-hash"]!;
    const reqSign = parsedHeaders.data["x-signature"]!;
    const reqRawBody = req.body; // json middleware must be included
    const resultStringToSign = reqMethod + reqPath + reqTimestamp.toString() + reqNonce + reqHashedBody;
    const resultSign = crypto.createHmac(
        env("RT_CREATE_REQUEST_HASH_FUNC"), 
        env("RT_CREATE_REQUEST_SECRET")
    )
        .update(resultStringToSign)
        .digest(env("RT_CREATE_REQUEST_ENCODING"));
    const redisKey = `${ rkPrefix }_req:${ reqNonce }`;
    const rtCRExpirationDelay = env("RT_CREATE_REQUEST_EXPIRATION_DELAY");

    // check signature
    if (resultSign !== reqSign){
        throw new errors.TokenRequestValidationError(rkPrefix);
    }

    // hashed body must corresponds to hashed raw body 
    if (await hashRaw(JSON.stringify(reqRawBody)) !== reqHashedBody){
        throw new errors.TokenRequestValidationError(rkPrefix);
    }

    // check if request is expired or this one was already sent
    if (dayjs(reqTimestamp).diff(dayjs()) < rtCRExpirationDelay){
        const r = await redis.exists(redisKey);

        if (r == 1){
            throw new errors.TokenRequestValidationError(rkPrefix);
        }
    }
    else {
        throw new errors.TokenRequestValidationError(rkPrefix);
    }

    // register this request
    await redis.set(redisKey, "", { EX: rtCRExpirationDelay, NX: true });

    return parsedBody.data as ResponseBodyType;
}

interface CreateNewTokensParams extends Omit<SetUpPayloadParams, "type"> {}

function catchError (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
){
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]){
        try {

            // except directives
            original.name != "resolve" && logger.debug(`Got request on ${ original.name }`);

            return await original.apply(this, args);
        }
        catch (error: any) {
            if (error.apiResponse){
                return error.apiResponse;
            };

            return responses.f500Response();
        }
    }
}

async function createNewTokens(
    redis: types.AppContext["dataSources"]["redis"], 
    { userId, role }: CreateNewTokensParams
): Promise<types.TokensType> {
    return {
        rt: (await (auth.RefreshToken.create(redis, { role, userId }))).jwt,
        at: await auth.AccessToken.create({ role, userId })   
    }
}

export function createRTMiddleware(redis: types.AppContext["dataSources"]["redis"]){
    async function middleware(req: Request, res: Response){ 
        let { role, userId } = await validateCreateRequest<CreateNewTokensParams>(
            {
                req, 
                redis, 
                rkPrefix: "rt", 
                bodySchema: z.object(
                    {
                        "userId": z.string().nullable(),
                        "role": z.enum(types.RoleEnum)
                    }
                )
            }
        );

        if (role == types.RoleEnum.Guest || role == types.RoleEnum.Superuser){
            userId = nanoid(env("GUEST_ID_LENGTH"));
        }
        else throw new errors.TokenRequestValidationError("rt");

        return res.json(
            responses.f200Response(
                [ await createNewTokens(redis, { role, userId }) ]
            )
        );
        
    }

    return middleware;
}

export function createATMiddleware(redis: types.AppContext["dataSources"]["redis"]){
    async function middleware(req: Request, res: Response){ 
        const { rt } = await validateCreateRequest<{ rt: string }>(
            { 
                req, 
                redis, 
                rkPrefix: "at",
                bodySchema: z.object({ rt: z.jwt() })
            }
        );
        const rtIns = await auth.RefreshToken.getByAT(rt, redis);

        if (!rtIns) throw new errors.RTIsNotRegisteredError(rt);

        await rtIns.revoke();

        const rtClaims = rtIns.decode();

        console.log(rtClaims)        

        return res.json(
            responses.f200Response(
                [ await createNewTokens(redis, { role: rtClaims.aud, userId: rtClaims.sub }) ]
            )
        );
        
    }

    return middleware;
}