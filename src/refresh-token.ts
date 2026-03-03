
import http from "http";
import crypto, { createHmac } from "node:crypto";
import { env } from "@lib/utils";

const DEFAULT_HASH_ALG = "SHA-256";
const DEFAULT_SIGN_ENCRYPTION = "hex";

async function hashRaw(raw: string){
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);

    // hash
    return new Uint8Array(await crypto.subtle.digest(DEFAULT_HASH_ALG, data)).toHex();
}

// route function
async function validateRTCreateRequest(
    req: http.IncomingMessage, 
    res: http.OutgoingMessage, 
    { sourcePath, sourceMethod }: 
    { sourcePath: string, sourceMethod: "GET" | "POST" | "DELETE" | "PUT" }
){
    const reqMethod = req.method;
    const reqPath = new URL(req.url).pathname;
    const reqTimestamp = req.headers["x-timestamp"];
    const reqNonce = req.headers["x-nonce"];
    const reqHashedBody = req.headers["x-body-hash"];
    const reqSign = req.headers["x-signature"];
    const reqRawBody = req.body; // json middlware must be included
    const resultStringToSign = reqMethod + reqPath + reqNonce + reqHashedBody;
    const resultSign = crypto.createHmac(DEFAULT_HASH_ALG, env("RT_CREATE_SECRET"))
        .update(resultStringToSign)
        .digest(DEFAULT_SIGN_ENCRYPTION);

    if (resultSign !== reqSign){
        return res.sendStatus(403);
    }

    if (await hashRaw(reqRawBody) !== reqHashedBody){
        return res.sendStatus(403);
    }

    if (await ){

    }
}