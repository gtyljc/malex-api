
import crypto from "node:crypto";
import { env } from "@lib/utils";
import { createClient } from "redis";
import { Response, Request } from "express";
import * as responses from "@src/responses";
import z from "zod";
import { createPair, ROLES } from "./jwt-auth";
import { dayjs } from "@lib/utils";

const DEFAULT_HASH_FUNC = "SHA-256";
const DEFAULT_ENCODING = "hex";

async function hashRaw(raw: string){
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const buffer = new Uint8Array(await crypto.subtle.digest(DEFAULT_HASH_FUNC, data));
    
    // hash
    return Buffer.from(buffer).toString(DEFAULT_ENCODING);
}

// route function
export function validateRTCreateRequest(redis: ReturnType<typeof createClient>){
    async function middleware(req: Request, res: Response){
        const headersSchema = z.object(
            {
                "x-timestamp": z.coerce.number(),
                "x-nonce": z.string(),
                "x-body-hash": z.string(),
                "x-signature": z.string()
            }
        );
        const parsedHeaders = headersSchema.safeParse(req.headers);

        if (!parsedHeaders.success){
            return res.json(responses.f400Response());
        }

        const bodySchema = z.object(
            {
                "userId": z.string().nullable(),
                "role": z.enum(ROLES)
            }
        )
        
        console.log(req.body);

        const parsedBody = bodySchema.safeParse(req.body);

        if (!parsedBody.success){
            console.log(parsedBody.error);

            return res.json(responses.f400Response());
        }

        const reqMethod = req.method;
        const reqPath = new URL(req.url!).pathname;
        const reqTimestamp = parsedHeaders.data["x-timestamp"]!;
        const reqNonce = parsedHeaders.data["x-nonce"]!;
        const reqHashedBody = parsedHeaders.data["x-body-hash"]!;
        const reqSign = parsedHeaders.data["x-signature"]!;
        const reqRawBody = req.body; // json middleware must be included
        const resultStringToSign = reqMethod + reqPath + reqTimestamp.toString() + reqNonce + reqHashedBody;
        const resultSign = crypto.createHmac(DEFAULT_HASH_FUNC, env("RT_CREATE_SECRET"))
            .update(resultStringToSign)
            .digest(DEFAULT_ENCODING);
        const redisKey = `rt_req:${ reqSign }`;

        // check signature
        if (resultSign !== reqSign){
            return res.json(responses.f403Response());
        }

        // hashed body must corresponds to hashed raw body 
        if (await hashRaw(JSON.stringify(reqRawBody)) !== reqHashedBody){
            return res.json(responses.f403Response());
        }

        // check if request is expired or 
        if (dayjs(reqTimestamp).diff(dayjs()) < env("RT_REQUEST_EXPIRATION_DELAY")){
            const r = await redis.exists(redisKey);
            
            if (r != 1){
                return res.json(responses.f403Response());
            }
        }

        // register this request
        await redis.set(redisKey, reqNonce, { EX: env("RT_REQUEST_EXPIRATION_DELAY") });

        return res.json(
            await createPair(
                redis, 
                { 
                    userId: parsedBody.data["userId"], 
                    role: parsedBody.data["role"] 
                }
            )
        );
    }

    return middleware;
}