
import { SignJWT, jwtVerify } from "jose";
import * as types from "./types";
import dayjs from "dayjs";

// converts IPv6 to IPv4
function normalizeIp(ip: string): string {
    
    // IPv4-mapped IPv6 -> IPv4
    if (ip.startsWith("::ffff:")) return ip.slice(7);

    return ip;
}

// checks was request from localhost sent
function isFromLocalhost(senderIP: string): boolean {
    const ip = normalizeIp(senderIP);

    if (ip === "127.0.0.1") return true; // IPv4 

    if (ip === "::1") return true; // IPv6

    return false;
}

// checks was request from backend sent
export function isSentFromBackend(senderIP: string){
    return senderIP == process.env.BACKEND_IP || isFromLocalhost(senderIP)
}

// parses jwt token from header ( deletes 'Bearer' keyword )
export function getJWTFromHeader(header: string): string{
    return header.replace("Bearer ", "")
}

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

// returns new JWT based on specified params
async function getJWT(header: types.JWTHeader, payload: types.JWTPayload): Promise<string> {
    return await new SignJWT(payload).setProtectedHeader(header).sign(await getJWK());
}

// returns refresh token ( represents JWT token )
export async function getRT(role: types.Roles, db: types.AppContext["dataSources"]["db"]): Promise<string> {
    const expiredAt = dayjs().add(parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DELAY), "hours").unix();
    const rt = await getJWT(
        { alg: "HS256" }, 
        {
            aud: role,
            iss: "malex:api",
            iat: dayjs().unix(),
            exp: expiredAt
        }
    );
    const [ header, payload, sign ] = rt.split("."); 

    // register RT into DB
    await db.create("refreshToken", { hash: sign, expired_at: expiredAt });

    return rt;
}

// returns access token ( represents JWT token )
export async function getAT(role: types.Roles): Promise<string> {
    return await getJWT(
        { alg: "HS256" }, 
        {
            aud: role,
            iss: "malex:api",
            iat: dayjs().unix(),
            exp: dayjs().add(parseInt(process.env.ACCESS_TOKEN_EXPIRATION_DELAY), "hours").unix() 
        }
    )
}

// generates pair with access JWT and RT ( also JWT )
export async function getRTAndATPair(role: types.Roles, db: types.AppContext["dataSources"]["db"]): Promise<{ token: string, r_token: string }> {  
    return {
        token: await getAT(role),
        r_token: await getRT(role, db)
    }
}

// validates JWT on header, payload ( claims ), and expiration time
export async function validateJWT(jwt: string) {
    const options: types.VerifyOptions  = {
        algorithms: [ "HS256" ],
        audience: [ "ADMIN", "USER" ],
        issuer: "malex:api",
        requiredClaims: [ "iss", "aud", "iat", "exp" ]
    };

    // in case of validation error will throw error
    try { return await jwtVerify(jwt, await getJWK(), options) }
    catch(error) { console.log(error); return null }
}
