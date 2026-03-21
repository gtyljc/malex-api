
import crypto from "node:crypto";
import { env } from "@lib/utils";
import { createClient } from "redis";
import { Response, Request } from "express";
import * as responses from "@lib/responses";
import z from "zod";
import { ROLES } from "@src/auth/client-auth";
import { dayjs } from "@lib/utils";
import * as errors from "@lib/errors";
import * as auth from "@src/auth/client-auth";
import * as types from "@lib/types";

async function hashRaw(raw: string){
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const buffer = new Uint8Array(
        await crypto.subtle.digest(env("RT_CREATE_REQUEST_HASH_FUNC"), data)
    );
    
    // hash
    return Buffer.from(buffer).toString(env("RT_CREATE_REQUEST_ENCODING"));
};

interface ValidateRequestParams {
    req: Request
    redis: types.AppContext["dataSources"]["redis"]
    rkPrefix: "rt" | "at"
}

async function validateCreationRequest({ req, redis, rkPrefix }: ValidateRequestParams) {
    const headersSchema = z.object(
        {
            "x-timestamp": z.coerce.number(),
            "x-nonce": z.string(),
            "x-body-hash": z.string(),
            "x-signature": z.string()
        }
    );
    const parsedHeaders = headersSchema.safeParse(req.headers);

    if (!parsedHeaders.success) throw new errors.RTCreationError();

    const bodySchema = z.object(
        {
            "userId": z.string().nullable(),
            "role": z.enum(ROLES)
        }
    )

    const parsedBody = bodySchema.safeParse(req.body);

    if (!parsedBody.success) throw new errors.RTCreationError();

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
        throw new errors.RTCreationError();
    }

    // hashed body must corresponds to hashed raw body 
    if (await hashRaw(JSON.stringify(reqRawBody)) !== reqHashedBody){
        throw new errors.RTCreationError();
    }

    // check if request is expired or this one was already sent
    if (dayjs(reqTimestamp).diff(dayjs()) < rtCRExpirationDelay){
        const r = await redis.exists(redisKey);

        if (r == 1){
            throw new errors.RTCreationError();
        }
    }
    else {
        throw new errors.RTCreationError();
    }

    // register this request
    await redis.set(redisKey, "", { EX: rtCRExpirationDelay, NX: true });

    return parsedBody.data;
}

export function validateRTCreateRequest(redis: ReturnType<typeof createClient>){
    async function middleware(req: Request, res: Response){ 
        const { role, userId } = await validateCreationRequest({ req, redis, rkPrefix: "rt" });

        return res.json(
            responses.f200Response(
                [ await auth.createTokenPair(redis, { role, userId }) ]
            )
        );
        
    }

    return middleware;
}

export function validateATCreateRequest(redis: ReturnType<typeof createClient>){
    async function middleware(req: Request, res: Response){ 
        const { role, userId } = await validateCreationRequest({ req, redis, rkPrefix: "at" });

        return res.json(
            responses.f200Response(
                [ await auth.createTokenPair(redis, { role, userId }) ]
            )
        );
        
    }

    return middleware;
}