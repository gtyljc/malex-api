
import * as jose from "jose";
import * as types from "@lib/types";
import { dayjs } from "@lib/utils";
import { env, serializeCookie } from "@lib/utils";
import logger from "@lib/logger";
import * as errors from "@lib/errors";

enum TokenTypeEnum {
    RefreshToken = "rt",
    AccessToken = "at"
}

export interface SetUpPayloadParams {
    userId: string,
    role: types.RoleEnum
    type: TokenTypeEnum
}

interface ValidationOptions extends jose.VerifyOptions, jose.JWTClaimVerificationOptions  {
    algorithms: [ "HS256" ],
    issuer: string,
    audience: types.RoleEnum[]
    ver: string
    type: TokenTypeEnum[]
}

interface DefaultPayload extends jose.JWTPayload {
    aud: types.RoleEnum,
    ver: string
}

interface JWTParts {
    header: string,
    payload: string,
    sign: string
}

export class JWT {
    jwt: string | undefined;
    validationOptions: ValidationOptions = {
        algorithms: [ "HS256" ],
        issuer: env("JWT_DEFAULT_ISSUER"),
        ver: env("JWT_DEFAULT_VERSION"),
        audience: [
            types.RoleEnum.Admin,
            types.RoleEnum.Superadmin,
            types.RoleEnum.Superuser,
            types.RoleEnum.User,
            types.RoleEnum.Guest,
        ],
        requiredClaims: [ "sub", "aud", "iat", "exp", "ver", "iss" ],
        type: [ TokenTypeEnum.AccessToken, TokenTypeEnum.AccessToken ]
    };
    jwtHeader: jose.JWTHeaderParameters = { "alg": "HS256" };
    jwtSecret: CryptoKey;

    constructor(jwt?: string){
        this.jwt = jwt;
    }

    async importSecret(): Promise<CryptoKey> {
        if (this.jwtSecret) return this.jwtSecret;
        
        const secret = new TextEncoder().encode(env("API_SIGN_SECRET"));
        const cryptoKey = await global.crypto.subtle.importKey(
            "raw",
            secret,
            { name: "HMAC", hash: "SHA-256" }, 
            true,
            [ "verify", "sign" ]
        );
        
        this.jwtSecret = cryptoKey;

        return cryptoKey;
    }

    setUpPayload({ userId, role, type }: SetUpPayloadParams): DefaultPayload {
        return {
            iss: env("JWT_DEFAULT_ISSUER"),
            sub: userId,
            aud: role,
            iat: dayjs().unix(),
            exp: dayjs().add(env("REFRESH_TOKEN_EXPIRATION_DELAY"), "seconds").unix(),
            ver: env("JWT_DEFAULT_VERSION"),
            typ: type
        }
    }

    static getFromHeader(header: string): JWT {
        return new JWT(header.replace("Bearer ", ""));
    }

    separate(): JWTParts {
        const [ header, payload, sign ] = this.jwt.split(".");
        
        return { header, payload, sign };
    }

    decode(): DefaultPayload {
        return jose.decodeJwt<DefaultPayload>(this.jwt);
    }

    async validate(): Promise<jose.JWTVerifyResult<DefaultPayload>> {
        try {
            return await jose.jwtVerify(
                this.jwt, 
                await this.importSecret(), 
                this.validationOptions
            );
        }
        catch(error: any) { 
            throw new errors.JWTValidationError(this.jwt, error);
        }
    }

    static async generate({ userId, role, type }: SetUpPayloadParams): Promise<JWT> {
        const jwtIns = new JWT();
        const token = await new jose.SignJWT(
            jwtIns.setUpPayload({ userId, role, type })
        ).setProtectedHeader(jwtIns.jwtHeader).sign(await jwtIns.importSecret());

        jwtIns.jwt = token;

        return jwtIns;
    }
}

interface CreateRefreshTokenParams extends Omit<SetUpPayloadParams, "type"> {}

export class RefreshToken extends JWT {
    redis: types.AppContext["dataSources"]["redis"];
    redisKey: string;

    constructor(jwt: string, redis: types.AppContext["dataSources"]["redis"]){  
        super(jwt);
        
        this.redis = redis;
        this.redisKey = this.createRedisKey();
    }

    createRedisKey(): string {
        return `rt:${ jose.decodeJwt(this.jwt).sub }`;
    }

    static createRedisKey(jwt: string): string {
        return `rt:${ jose.decodeJwt(jwt).sub }`;
    }

    static async getByAT(
        jwt: string, 
        redis: types.AppContext["dataSources"]["redis"]
    ): Promise<RefreshToken | null> {
        const r = await redis.get(RefreshToken.createRedisKey(jwt));

        if (!r) return null;

        return new RefreshToken(jwt, redis);
    }

    static async create(
        redis: types.AppContext["dataSources"]["redis"],
        { userId, role }: CreateRefreshTokenParams
    ): Promise<RefreshToken> {
        logger.info(`Creating RT for user with id ${ userId } and role ${ role }`);

        const jwt = await this.generate({ userId, role, type: TokenTypeEnum.RefreshToken });
        const refIns = new RefreshToken(jwt.jwt, redis);
        const redisKey = refIns.createRedisKey();
        const { sign } = jwt.separate();
        const rtExpirationDelay = env("REFRESH_TOKEN_EXPIRATION_DELAY");
        const jwtData = {
            sign,
            role,
            user_id: userId,
            created_at: dayjs().unix(),
            expired_at: dayjs().add(rtExpirationDelay, "s").unix()
        };

        if (await redis.exists(redisKey) == 1) throw new errors.RTRegistrationError(sign);

        // register
        await redis.set(redisKey, JSON.stringify(jwtData), { NX: true, EX: rtExpirationDelay });

        return refIns;
    }

    async isRegistered(): Promise<boolean> {
        const r = await this.redis.exists(this.redisKey);

        if (r != 1) throw new errors.RTIsNotRegisteredError(this.jwt);

        return true;
    }

    async revoke(): Promise<this> {
        logger.info(`Revoking RT with sign ${ this.separate().sign }`);
        
        await this.redis.del(this.redisKey);

        return this;
    }
}

interface CreateAccessTokenParams extends Omit<SetUpPayloadParams, "type"> {}

export class AccessToken extends JWT {
    static async create({ userId, role }: CreateAccessTokenParams): Promise<string> {
        logger.info(`Creating AT for user with id ${ userId } and role ${ role }`);

        return (await this.generate({ userId, role, type: TokenTypeEnum.AccessToken })).jwt
    }
}

interface CreateTokenPairReturn {
    rt: string;
    at: string;
}

interface setNewTokensToResponseParams extends Omit<SetUpPayloadParams, "type"> {
    res: types.AppContext["res"],
    redis: types.AppContext["dataSources"]["redis"]
}

export async function setNewTokensToResponse(
    { res, redis, userId, role }: setNewTokensToResponseParams
): Promise<CreateTokenPairReturn> {
    const newPair = {
        rt: (await RefreshToken.create(redis, { userId, role })).jwt,
        at: await AccessToken.create({ userId, role })
    };
    
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