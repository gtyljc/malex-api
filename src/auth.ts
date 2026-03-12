
import * as jose from "jose";
import * as types from "@lib/types";
import { dayjs } from "@lib/utils";
import { env, serializeCookie } from "@lib/utils";
import logger from "@lib/logger";
import * as errors from "@src/errors";
import { nanoid } from "nanoid";

export const ROLES: Array<types.Role> = [ 
    "ADMIN", 
    "SUPERADMIN", 
    "GUEST", 
    "USER", 
    "SUPERUSER"
]

interface DefaultPayloadParams {
    userId?: string | null,
    role?: types.Role,
    issuer?: string
}

const DEFAULT_PAYLOAD = (
    { 
        userId = null, 
        role = "GUEST", 
        issuer = env("JWT_DEFAULT_ISSUER")
    }: 
    DefaultPayloadParams = {}
): types.DefaultPayload => (
    {
        iss: issuer,
        sub: userId,
        aud: role,
        iat: dayjs().unix(),
        exp: dayjs().add(env("REFRESH_TOKEN_EXPIRATION_DELAY"), "seconds").unix(),
    }
);
const DEFAULT_HEADER: types.DefaultHeader = { alg: "HS256" };

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
    payload: types.DefaultPayload, 
    header: types.DefaultHeader = DEFAULT_HEADER
): Promise<string>{
    return await new jose.SignJWT(payload)
        .setProtectedHeader(header)
        .sign(await importSecret(env("API_SIGN_SECRET")));
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
        await jose.jwtVerify<types.DefaultPayload>(
            jwt, 
            await importSecret(env("API_SIGN_SECRET")), 
            options
        );
        
        return true;
    }
    catch(error) { 
        throw new errors.JWTValidationError(jwt);
    }
}

export class JWT {

    static getJWTFromHeader(header: string): string {
        return header.replace("Bearer ", "")
    }

    static separateJWT(jwt: string){
        const [ header, payload, sign ] = jwt.split(".");
        
        return { header, payload, sign };
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

    static createRedisKey(jwt: string): string {
        return `rt:${ jose.decodeJwt(jwt).sub }`;
    }

    async isRegistered(): Promise<boolean> {
        const r = await this.redis.exists(this.redisKey);

        if (r != 1) throw new errors.RTIsNotRegistered(this.jwt);

        return true;
    }

    // means flaged as revoked in DB
    async revoke(): Promise<this> {
        logger.info(`Revoking RT with sign ${ JWT.separateJWT(this.jwt).sign }`);

        await this.redis.del(this.redisKey);

        logger.info(`RT with sign ${ JWT.separateJWT(this.jwt).sign } is revoked!`);

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
        { userId, role }: CreateTokenPairOptions
    ): Promise<RefreshToken | void> {
        
        // everybody must have an ID, because of this reason it will
        // generate absolutly random ID instead
        userId = userId ? userId: nanoid(env("RT_GUEST_ID_LENGTH"));

        const jwt = await generateJWT(DEFAULT_PAYLOAD({ userId, role }));
        const redisKey = RefreshToken.createRedisKey(jwt);
        const { sign } = JWT.separateJWT(jwt);
        const rtExpirationDelay = env("REFRESH_TOKEN_EXPIRATION_DELAY");
        const jwtData = {
            sign,
            role,
            user_id: userId,
            created_at: dayjs().unix(),
            expired_at: dayjs().add(rtExpirationDelay, "s").unix()
        };

        logger.info(`Creating RT with sign ${ sign }`);

        if (await redis.exists(redisKey) == 1) throw new errors.RTRegistrationError(sign);

        // register
        await redis.set(redisKey, JSON.stringify(jwtData), { NX: true, EX: rtExpirationDelay });

        logger.info(`RT with sign ${ sign } was successfully created`);

        return new RefreshToken(jwt, redis);
    }
}

export class AccessToken {
    static async create(
        { userId, role }: CreateTokenPairOptions
    ): Promise<string> {
        return await generateJWT(DEFAULT_PAYLOAD({ userId, role }))
    }
}

interface CreateTokenPairOptions {
    userId: string | null,
    role: types.Role
}

interface CreateTokenPairReturn {
    rt: string;
    at: string;
}

export async function createTokenPair(
    redis: types.AppContext["dataSources"]["redis"], 
    { userId, role }: CreateTokenPairOptions
): Promise<CreateTokenPairReturn> {
    return {
        at: await AccessToken.create({ userId, role }),
        rt: (await RefreshToken.create(redis, { userId, role }))?.jwt
    }
}

interface ResponseWithTokensParams extends CreateTokenPairOptions {
    res: types.AppContext["res"],
    redis: types.AppContext["dataSources"]["redis"]
}

export async function responseWithTokens(
    {
        res,
        redis,
        userId,
        role
    }: ResponseWithTokensParams
): Promise<CreateTokenPairReturn> {
    const newPair = await createTokenPair(redis, { userId, role });
    
    // set new cookies
    res.setHeader(
        "Set-Cookie",
        [
            serializeCookie("a_token", newPair.at),
            serializeCookie("r_token", newPair.rt)
        ]
    );

    return newPair;
}