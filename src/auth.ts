
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import * as types from "./types";
import dayjs from "dayjs";
import * as tools from "./tools";

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
export function isSentFromBackend(senderIP: string): boolean {
    return senderIP == process.env.BACKEND_IP || isFromLocalhost(senderIP)
}

// parses jwt token from header ( deletes 'Bearer' keyword )
export function getJWTFromHeader(header: string): string{
    return header.replace("Bearer ", "")
}

// returns "ready to use" secret
export async function getJWK(): Promise<CryptoKey> {
    const secret = new TextEncoder().encode(process.env.API_SECRET);

    return await global.crypto.subtle.importKey(
        "raw",
        secret,
        {
            name: "HMAC",
            hash: "SHA-256"
        }, true, [ "verify", "sign" ]
    );
}

// returns new JWT based on specified params
export async function getJWT(
    header: types.JWTHeader, 
    payload: types.JWTPayload
): Promise<string> {
    return await new SignJWT(payload).setProtectedHeader(header).sign(await getJWK());
}

// validates JWT on header, payload ( claims ), and expiration time
export async function validateJWT(jwt: string) {
    const options: types.VerifyOptions  = {
        algorithms: [ "HS256" ],
        audience: [ "ADMIN", "SUPERADMIN", "GUEST", "USER", "SUPERUSER" ],
        issuer: "malex:api",
        requiredClaims: [ "iss", "aud", "iat", "exp", "sub" ]
    };

    // in case of validation error will throw error
    try { return await jwtVerify(jwt, await getJWK(), options) }
    catch(error) { console.log(error); return null }
}

// returns new RT, and register in DB
export async function getRT(
    user_id: string,
    role: types.Roles, 
    db: types.AppContext["dataSources"]["db"]
): Promise<string> {
    const expiredAt = dayjs().add(parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DELAY), "hours");
    const rt = await getJWT(
        { alg: "HS256" }, 
        {
            aud: role,
            iss: "malex:api",
            iat: dayjs().unix(),
            exp: expiredAt.unix(),
            sub: user_id
        }
    );
    const [ header, payload, sign ] = rt.split("."); 

    // register RT into DB
    await db.create("refreshToken", { hash: sign, expired_at: expiredAt.toDate(), role, user_id });

    return rt;
}

// if refresh token exists returns all it's claims, if not then null
export async function isRTExist(rt: string, db: types.AppContext["dataSources"]["db"]) {
    const claims = decodeJwt<types.JWTPayload>(rt);
    const [ header, payload, sign ] = rt.split(".");
    const isExist = !tools.isEmpty(
        (
            await db.getOneByFilter(
                "refreshToken", 
                { 
                    hash: sign,
                    is_revoked: false, 
                    role: claims.aud, 
                    user_id: claims.sub,
                    expired_at: { lt: dayjs().toDate() }
                }
            )
        ).data
    );

    if(isExist) return claims;

    return null;
}

// needs an sub param in jwt, to get user id, and then revokes 
// RT with his id; accepts any jwt ( RT or AT )
export async function revokeRT(jwt: string, db: types.AppContext["dataSources"]["db"]) {
    const claims = decodeJwt<types.JWTPayload>(jwt);

    // mark RT as revoked in DB
    return await db.updateManyByFilter(
        "refreshToken", 
        { user_id: claims.sub, role: claims.aud, is_revoked: false }, 
        { is_revoked: true }
    );
}

// returns new AT
export async function getAT(user_id: string, role: types.Roles): Promise<string> {
    return await getJWT(
        { alg: "HS256" }, 
        {
            aud: role,
            iss: "malex:api",
            iat: dayjs().unix(),
            exp: dayjs().add(parseInt(process.env.ACCESS_TOKEN_EXPIRATION_DELAY), "hours").unix(),
            sub: user_id
        }
    )
}

// generates pair with access JWT and RT ( also JWT )
export async function getAuthPair(
    user_id: string,
    role: types.Roles, 
    db: types.AppContext["dataSources"]["db"]
): Promise<{ token: string, r_token: string }> {
    return {
        token: await getAT(user_id, role),
        r_token: await getRT(user_id, role, db)
    }
}