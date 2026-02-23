
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import * as types from "./types";
import * as utils from "@lib/utils";
import { nanoid } from "nanoid";

class JWT {
    jwk!: CryptoKey;

    constructor() {

        // init jwk
        this.setJWK().then((value) => this.jwk = value);
    }

    separateJWT(jwt: string){
        const [ header, payload, sign ] = jwt.split(".");
        
        return { header, payload, sign };
    }

    async generate(_payload: types.JWTPayload) {
        const _header: types.JWTHeader = { alg: "HS256" };
        
        return await new SignJWT(_payload).setProtectedHeader(_header).sign(this.jwk);
    }

    // validates jwt that got in request ( authorization header )
    async validate(jwt: string): Promise<boolean> {
        const options: types.VerifyOptions  = {
            algorithms: [ "HS256" ],
            audience: [ "ADMIN", "SUPERADMIN", "GUEST", "USER", "SUPERUSER" ],
            issuer: "malex:api",
            requiredClaims: [ "iss", "aud", "iat", "exp", "sub" ]
        };

        // in case of validation error will throw error
        try { 
            await jwtVerify(jwt, this.jwk, options);
            
            return true;
        }
        catch(error) { 
            return false;
        }
    }

    // gets secret from .env and creates jwk to sign jwt ( must be used only by constructor )
    private async setJWK(): Promise<CryptoKey> {
        const secret = new TextEncoder().encode(process.env.API_SECRET);
    
        return await global.crypto.subtle.importKey(
            "raw",
            secret,
            {
                name: "HMAC",
                hash: "SHA-256"
            }, 
            true, 
            [ "verify", "sign" ]
        );
    }
}

export const jwt = new JWT();

export class RefreshToken {
    jwt: string;
    db: types.AppContext["dataSources"]["db"];

    constructor(jwt: string, db: types.AppContext["dataSources"]["db"]){
        this.jwt = jwt;
        this.db = db;
    }

    // checks if RT is registered in DB
    async isRegistered(): Promise<boolean> {
        const claims = decodeJwt<types.JWTPayload>(this.jwt);
        const { sign } = jwt.separateJWT(this.jwt);
        const q = await this.db.getOneByFilter(
            "refreshToken", 
            { 
                hash: sign,
                is_revoked: false, 
                role: claims.aud,
                user_id: claims.sub,
                expired_at: { gte: utils.dayjs().toISOString() }
            }
        );
        
        if (!q.qResult) return false;

        return true; 
    }

    // revokes current RT, means flaged as revoked in DB
    async revoke(): Promise<this> {
        const claims = decodeJwt<types.JWTPayload>(this.jwt);

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

        return this;
    }

    static async searchByAT(
        at: string, 
        db: types.AppContext["dataSources"]["db"]
    ): Promise<RefreshToken | null> {
        const claims = decodeJwt<types.JWTPayload>(at);
        const { sign } = jwt.separateJWT(at);
        const q = await db.getOneByFilter(
            "refreshToken",
            { 
                hash: sign,
                is_revoked: false, 
                role: claims.aud, 
                user_id: claims.sub,
                expired_at: { lt: utils.dayjs().toDate() }
            }
        )

        if (!utils.isEmpty(q.qResult)){
            return null;
        }

        return new RefreshToken(q.qResult, db);
    }

    // includes token reqgistration in DB
    static async create(
        role: types.Roles, 
        userId: string, 
        db: types.AppContext["dataSources"]["db"]
    ): Promise<RefreshToken> {
        const expiredAt = utils.dayjs().add(parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DELAY!), "seconds");
        const token = await jwt.generate(
            {
                aud: role,
                iss: "malex:api",
                iat: utils.dayjs().unix(),
                exp: expiredAt.unix(),
                sub: userId
            }
        );
        const { sign } = jwt.separateJWT(token);

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

        return new RefreshToken(token, db);
    }
}

export class AccessToken {
    static async create(role: types.Roles, userId: string): Promise<string> {
        return await jwt.generate(
            {
                aud: role,
                iss: "malex:api",
                iat: utils.dayjs().unix(),
                exp: utils.dayjs().add(parseInt(process.env.ACCESS_TOKEN_EXPIRATION_DELAY!), "seconds").unix(),
                sub: userId
            }
        )
    }
}

// creates new pair of AT and RT
export async function createAuthTokens(
    userId: string = nanoid(parseInt(process.env.USER_ID_LENGTH!)), 
    role: types.Roles = "GUEST", 
    db: types.AppContext["dataSources"]["db"]
): Promise<{ at: string, rt: string }>  {
    return {
        at: await AccessToken.create(role, userId),
        rt: (await RefreshToken.create(role, userId, db)).jwt
    }
}