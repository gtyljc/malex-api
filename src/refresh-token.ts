
import crypto from "node:crypto";
import { env, logErrorAndReturn } from "@lib/utils";
import { createClient } from "redis";
import { Response, Request } from "express";
import * as responses from "@src/responses";
import z from "zod";
import { ROLES } from "@src/auth";
import { dayjs } from "@lib/utils";
import * as errors from "@src/errors";
import * as auth from "@src/auth";

async function hashRaw(raw: string){
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const buffer = new Uint8Array(
        await crypto.subtle.digest(env("RT_CREATE_REQUEST_HASH_FUNC"), data)
    );
    
    // hash
    return Buffer.from(buffer).toString(env("RT_CREATE_REQUEST_ENCODING"));
};

export function validateRTCreateRequest(redis: ReturnType<typeof createClient>){
    async function middleware(req: Request, res: Response): Response {
        try {
            const headersSchema = z.object(
                {
                    "x-timestamp": z.coerce.number(),
                    "x-nonce": z.string(),
                    "x-body-hash": z.string(),
                    "x-signature": z.string()
                }
            );
            const parsedHeaders = headersSchema.safeParse(req.headers);

            if (!parsedHeaders.success) throw new errors.RTCreationError(responses.f400Response());

            const bodySchema = z.object(
                {
                    "userId": z.string().nullable(),
                    "role": z.enum(ROLES)
                }
            )

            const parsedBody = bodySchema.safeParse(req.body);

            if (!parsedBody.success) throw new errors.RTCreationError(responses.f400Response());

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
            const redisKey = `rt_req:${ reqNonce }`;
            const rtCRExpirationDelay = env("RT_CREATE_REQUEST_EXPIRATION_DELAY");

            // check signature
            if (resultSign !== reqSign){
                throw new errors.RTCreationError(responses.f403Response());
            }

            // hashed body must corresponds to hashed raw body 
            if (await hashRaw(JSON.stringify(reqRawBody)) !== reqHashedBody){
                throw new errors.RTCreationError(responses.f403Response());
            }

            // check if request is expired or this one was already sent
            if (dayjs(reqTimestamp).diff(dayjs()) < rtCRExpirationDelay){
                const r = await redis.exists(redisKey);

                if (r == 1){
                    throw new errors.RTCreationError(responses.f403Response());
                }
            }
            else {
                throw new errors.RTCreationError(responses.f403Response());
            }

            // register this request
            await redis.set(redisKey, "", { EX: rtCRExpirationDelay, NX: true });

            const role = parsedBody.data["role"];
            const userId = parsedBody.data["userId"];

            return res.json(
                responses.f200Response(
                    [ await auth.createTokenPair(redis, { role, userId }) ]
                )
            );
        }
        catch(error: any) {
            return res.json(logErrorAndReturn(error));
        }
    }

    return middleware;
}