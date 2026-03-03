
import * as jose from "jose";
import * as types from "./types";
import * as utils from "@lib/utils";
import { dayjs } from "@lib/utils";
import { env } from "@lib/utils";
import logger from "@lib/logger";
import * as errors from "@src/errors";

export const ROLES: Array<types.Role> = [ 
    "ADMIN", 
    "SUPERADMIN", 
    "GUEST", 
    "USER", 
    "SUPERUSER"
]

const DEFAULT_PAYLOAD = (
    { 
        userId = null, 
        role = "GUEST",
        issuer = "malex:api"
    }: {
        userId?: string | null,
        role?: types.Role,
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

// generation with already specified options
async function generateJWT(
    payload: jose.JWTPayload, 
    header: jose.JWTHeaderParameters = DEFAULT_HEADER
): Promise<string>{
    return await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .sign(await importSecret(env("API_SECRET")));
}

// validation with already specified options
export async function validateJWT(
    jwt: string,
    options = {
        algorithms: [ DEFAULT_HEADER.alg ],
        audience: ROLES,
        issuer: DEFAULT_PAYLOAD().iss,
        requiredClaims: Object.keys(DEFAULT_PAYLOAD())
    }
): Promise<boolean> {
    try {
        await jose.jwtVerify(jwt, await importSecret(env("API_SECRET")), options);
        
        return true;
    }
    catch(error) { 
        throw new errors.JWTValidationError();
    }
}

export class RefreshToken {
    jwt: string; // must be already validated
    redis: types.AppContext["dataSources"]["redis"];
    redisKey: string;

    constructor(jwt: string, redis: types.AppContext["dataSources"]["redis"]){
        this.jwt = jwt;
        this.redis = redis;
        this.redisKey = RefreshToken.createRedisKey(this.jwt);
    }

    async isRegistered(): Promise<boolean> {
        return (await this.redis.exists(this.redisKey)) == 1;
    }

    // means flaged as revoked in DB
    async revoke(): Promise<this> {
        logger.info(`Revoking RT with sign ${ utils.separateJWT(this.jwt).sign }`);

        await this.redis.del(this.redisKey);

        logger.info(`RT with sign ${ utils.separateJWT(this.jwt).sign } is revoked!`);

        return this;
    }

    static async searchByAT(
        at: string,
        redis: types.AppContext["dataSources"]["redis"]
    ): Promise<RefreshToken | null> {
        const r = await redis.get(RefreshToken.createRedisKey(at));

        if (!r) return null;

        return new RefreshToken(at, redis);
    }

    static async create(
        redis: types.AppContext["dataSources"]["redis"],
        { userId, role }: { userId: string | null, role: types.Role }
    ): Promise<RefreshToken | null> {
        const jwt = await generateJWT(DEFAULT_PAYLOAD({ userId, role }));
        const redisKey = RefreshToken.createRedisKey(jwt);
        const { sign } = utils.separateJWT(jwt);
    
        logger.info(`Creating RT with sign ${ sign }`)

        if (await redis.exists(redisKey) == 1) throw new errors.RTRegistrationError(sign);

        // register
        await redis.set(
            redisKey, 
            {
                sign,
                role,
                user_id: userId,
                created_at: dayjs().unix(),
                expired_at: dayjs().add(env("REFRESH_TOKEN_EXPIRATION_DELAY"), "s").unix()
            },
            {
                NX: true,
                EX: env("REFRESH_TOKEN_EXPIRATION_DELAY")
            }
        );

        logger.info(`RT with sign ${ sign } was successfully created`)

        return new RefreshToken(jwt, redis);
    }

    static createRedisKey(jwt: string){
        return `rt:${ jose.decodeJwt(jwt).sub }`;
    }
}

export class AccessToken {
    static async create(
        { userId, role }:
        { userId: string | null, role: types.Role }
    ): Promise<string> {
        return await generateJWT(DEFAULT_PAYLOAD({ userId, role }))
    }
}

export async function createPair(
    redis: types.AppContext["dataSources"]["redis"], 
    { userId, role }: { userId: string | null, role: types.Role }
): Promise<{ rt: string, at: string }> {
    return {
        at: await AccessToken.create({ userId, role }),
        rt: (await RefreshToken.create(redis, { userId, role }))?.jwt
    }
}