
import { formatSResponse, formatFResponse } from "../sources";
import * as types from "../types";
import { SignJWT, decodeJwt } from "jose";
import dayjs from "dayjs";
import { jwtVerify } from "jose/jwt/verify"

// returns "ready to use" secret
async function getJWK(): Promise<CryptoKey> {
    const secret = new TextEncoder().encode(process.env.API_SECRET);

    return await global.crypto.subtle.importKey(
        "raw",
        secret,
        {
            name: "HMAC",
            hash: "SHA-256"
        }, true, [ "verify" ]
    );
}

export async function validateJWT(jwt: string) {
    const jwk = await getJWK();
    const options: types.VerifyOptions  = {
        algorithms: [ "HS256" ],
        audience: [ "ADMIN", "USER" ],
        maxTokenAge: `${parseInt(process.env.TOKEN_EXPIRATION_DELAY)} hours`,
        issuer: "malex:api",
        requiredClaims: [ "alg", "iss", "aud" ]
    };

    // in case of validation error will throw error
    try { return await jwtVerify(jwt, jwk, options) }
    catch { return null }
}

// generate jwt with specified params
async function generateJWT(payload: types.JWTPayload, header: types.JWTHeader): Promise<string> {
    const secret = new TextEncoder().encode(process.env.API_SECRET);
    const jwt = new SignJWT(payload).setProtectedHeader(header);

    return await jwt.sign(secret);
}

// this mutation can be used only by Malex backend;
// creates JWT token
async function createJWT(role: types.Roles, senderIP: string): Promise<types.ResponseSchema> {
    
    // check IP of sender ( it's must be backend or localhost )
    if (senderIP != process.env.BACKEND_IP && senderIP != "::1") {
        return formatFResponse(403, "Unauthorizated request!")
    };

    const payload: types.JWTPayload = {
        aud: role,
        iat: dayjs().unix(),
        iss: "malex:api"
    };
    const header: types.JWTHeader = { alg: "HS256" };

    return formatSResponse([{ token: await generateJWT(payload, header) }]);
}

// verify login data from admin login page
async function adminLogin(
    username: string, 
    password: string,
    db: types.AppContext["dataSources"]["db"]
): Promise<types.ResponseSchema> {
    const r = (
        await db.getMany(
            "admins", 
            { filter: { username, password, is_logged: false } }
        )
    );

    // if admin exist
    if(r.data.length == 1){
        
        // // set is_logged flag to true
        // await db.updateOne("admins", r.data[0].id, { is_logged: true });

        return formatSResponse([{ token: (await createJWT("ADMIN", "::1")).data[0].token }])
    }

    return formatFResponse(403, "Unauthorizated request!");
}

async function refreshJWT(req: types.AppContext["req"]) {
    const claims = decodeJwt<types.JWTPayload>(req.headers.authorization.replace("Bearer", ""));
    const header: types.JWTHeader = { alg: "HS256" };

    // reset expiration time range
    claims.iat = dayjs().unix();

    return formatSResponse([{ token: await generateJWT(claims, header) }]);
}

export default {
    Mutation: {
        
        createJWT: async(
            _, 
            { role }: { role: types.Roles }, 
            { req }: types.AppContext
        ) => await createJWT(role, req.socket.remoteAddress),

        adminLogin: async(
            _,
            { username, password }: { username: string, password: string },
            { dataSources: { db } }: types.AppContext
        ) => await adminLogin(username, password, db),
    
        refreshJWT: async(
            _,
            __,
            { req }: types.AppContext
        ) => await refreshJWT(req)
    }
}