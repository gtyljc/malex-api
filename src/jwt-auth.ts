
import * as jose from "jose";
import * as types from "./types";
import * as utils from "@lib/utils";
import { dayjs } from "@lib/utils";
import { env } from "@lib/utils";
import logger from "@lib/logger";

const DEFAULT_PAYLOAD = (
    { 
        userId = null, 
        role = "GUEST",
        issuer = "malex:api"
    }: {
        userId?: string | null,
        role?: types.Roles,
        issuer?: string
    } = {}
): Record<any, string | number | null> => (
    {
        iss: issuer,
        sub: userId,
        aud: role,
        iat: dayjs().unix(),
        exp: dayjs().add(env("REFRESH_TOKEN_EXPIRATION_DELAY"), "seconds").unix(),
    }
);
const DEFAULT_HEADER = { alg: "HS256" };

async function importSecret(raw: string): Promise<CryptoKey> {
    const secret = new TextEncoder().encode(raw);
    
    return await global.crypto.subtle.importKey(
        "raw",
        secret,
        { name: "HMAC", hash: "SHA-256" }, 
        true,
        [ "verify", "sign" ]
    );
}

async function generateJWT(
    payload: jose.JWTPayload, 
    header: jose.JWTHeaderParameters = DEFAULT_HEADER
): Promise<string>{
    return await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .sign(await importSecret(env("API_SECRET")));
}

export async function validateJWT(
    jwt: string, 
    options = {
        algorithms: [ DEFAULT_HEADER.alg ],
        audience: [ "ADMIN", "SUPERADMIN", "GUEST", "USER", "SUPERUSER" ],
        issuer: DEFAULT_PAYLOAD().iss,
        requiredClaims: Object.keys(DEFAULT_PAYLOAD())
    }
): Promise<boolean> {
    try {
        await jose.jwtVerify(jwt, await importSecret(env("API_SECRET")), options);
        
        return true;
    }
    catch(error) { 
        return false;
    }
}

export class RefreshToken {
    jwt: string;
    redis: types.AppContext["dataSources"]["redis"];

    constructor(jwt: string, redis: types.AppContext["dataSources"]["redis"]){
        this.jwt = jwt;
        this.redis = redis;
    }

    async isRegistered(): Promise<boolean> {
        const claims = jose.decodeJwt(this.jwt);
        const { sign } = utils.separateJWT(this.jwt);
        const r = await this.redis.set(
            `${ claims.sub }:${ claims.aud }:rt`,
            {
                is_revoked: false,
                role: claims.aud,
                user_id: claims.sub,
                expired_at: { gte: dayjs().toISOString() }
            },
            {
                EX: 300,
                NX: true
            }
        )
        
        await this.db.getOneByFilter(
            "refreshToken", 
            { 
                hash: sign,
                is_revoked: false, 
                role: claims.aud,
                user_id: claims.sub,
                expired_at: { gte: dayjs().toISOString() }
            }
        );

        if (!q.qResult) return false;

        return true; 
    }

    // means flaged as revoked in DB
    async revoke(): Promise<this> {
        const claims = jose.decodeJwt(this.jwt);

        logger.info(`Revoking RT with sign ${ utils.separateJWT(this.jwt).sign }`)

        // mark RT as revoked in DB
        await this.db.updateManyByFilter(
            "refreshToken",
            { 
                user_id: claims.sub, 
                role: claims.aud, 
                is_revoked: false 
            }, 
            { is_revoked: true }
        );

        logger.info(`RT with sign ${ utils.separateJWT(this.jwt).sign } is revoked!`)

        return this;
    }

    static async searchByAT(
        db: types.AppContext["dataSources"]["db"],
        at: string
    ): Promise<RefreshToken | null> {
        const claims = jose.decodeJwt(at);
        const { sign } = utils.separateJWT(at);
        const q = await db.getOneByFilter(
            "refreshToken",
            { 
                hash: sign,
                is_revoked: false, 
                role: claims.aud, 
                user_id: claims.sub,
                expired_at: { lt: dayjs().toDate() }
            }
        )

        if (!utils.isEmpty(q.qResult)){
            return null;
        }

        return new RefreshToken(q.qResult, db);
    }

    // includes token reqgistration in DB
    static async create(
        db: types.AppContext["dataSources"]["db"],
        { userId, role }: { userId: string, role: types.Roles }
    ): Promise<RefreshToken> {
        const expiredAt = dayjs().add(parseInt(env("REFRESH_TOKEN_EXPIRATION_DELAY")), "seconds");
        const token = await generateJWT(DEFAULT_PAYLOAD({ userId, role }));
        const { sign } = utils.separateJWT(token);
        
        logger.info(`Creating RT with sign ${ sign }`)

        // register RT into DB
        await db.create(
            "refreshToken",
            { 
                hash: sign, 
                expired_at: expiredAt.toDate(), 
                role, 
                user_id: userId 
            }
        );

        logger.info(`RT with sign ${ sign } was successfully created`)

        return new RefreshToken(token, db);
    }
}

export class AccessToken {
    static async create(
        { userId, role }: 
        { userId: string, role: types.Roles }
    ): Promise<string> {
        return await generateJWT(DEFAULT_PAYLOAD({ userId, role }))
    }
}