
import * as responses from "@lib/responses";
import * as types from "@lib/types";
import * as auth from "@src/auth/client-auth";
import * as errors from "@lib/errors";
import { decodeJwt } from "jose";
import { ResolverSaveCatch } from "@lib/utils";
import logger from "@lib/logger";
import * as utils from "@lib/utils";
import { env } from "@lib/utils";

class AdminPanelKey {
    private currentValue: string;

    constructor(){
        this.currentValue = this.init();
    }

    get key(){
        return this.currentValue;
    }

    updateCurrentValue(){
        this.currentValue = crypto.randomUUID();
    }

    logCurrentValue(){
        logger.info(`Admin Panel available at ${ env("BASE_URL") }/admin?key=${ this.currentValue }`)
    }

    private init(){
        if (utils.env("NODE_ENV") != "development"){
            
            // update key with specified delay in .env
            setInterval(
                () => { this.updateCurrentValue(); this.logCurrentValue() }, 
                utils.env("ADMIN_PANEL_KEY_REFRESH_DELAY")
            );
        }

        return crypto.randomUUID();
    }
}

const APKey = new AdminPanelKey();

class Query {

    @ResolverSaveCatch
    adminPanelKey() {
        return responses.f200Response([ APKey.key ]);
    }

    @ResolverSaveCatch
    async checkAdmin(...args: any[]) {
        return responses.f200Response();
    }
}

class Mutation {

    @ResolverSaveCatch
    async createAT(
        _: any,
        __: any,
        { req, res, dataSources: { redis } }: types.AppContext
    ): Promise<types.AuthResponseType> {
        const rt = new auth.RefreshToken(req.cookies!.r_token, redis);

        await rt.isRegistered();

        await rt.revoke();

        const claims = decodeJwt<types.DefaultPayload>(rt.jwt);
        
        await auth.responseWithTokens({ res, redis, userId: claims.sub, role: claims.aud });

        return responses.f200Response();
    }

    @ResolverSaveCatch
    async adminLogin(
        _: any,
        { username, password }: types.MutationAdminLoginArgs,
        { dataSources: { db, redis }, res }: types.AppContext
    ): Promise<types.AuthResponseType> {
        const q = await db.getOneByFilter("admin", { username, password });

        // if admin not exist
        if(!q.qResult) throw new errors.AdminWasNotFoundError();

        // revoke current RT and give new one
        await auth.responseWithTokens({ res, redis, role: "ADMIN" });

        return responses.f200Response();
    }

    // revokes admin RT
    @ResolverSaveCatch
    async adminLogout(
        _: any, 
        __: any, 
        { req, res, dataSources: { redis } }: types.AppContext
    ): Promise<types.AuthResponseType> {
        const rt = new auth.RefreshToken(req.cookies!.r_token, redis);

        await rt.isRegistered();

        await rt.revoke();

        // revoke current RT and give new one
        await auth.responseWithTokens({ res, redis, role: "GUEST" });

        return responses.f200Response();
    }
}

const resolvers: types.Resolvers = {
    Mutation: new Mutation(),
    Query: new Query()
}

export default resolvers;