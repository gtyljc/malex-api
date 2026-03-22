
import * as responses from "@lib/responses";
import * as types from "@lib/types";
import * as auth from "@src/auth";
import * as errors from "@lib/errors";
import { env } from "@lib/utils";
import { nanoid } from "nanoid";
import * as utils from "@lib/utils";

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

    private init(){

        // update key with specified delay in .env
        setInterval(
            () => { this.updateCurrentValue() }, 
            utils.env("ADMIN_PANEL_KEY_REFRESH_DELAY")
        );

        return crypto.randomUUID();
    }
}

const APKey = new AdminPanelKey();

class Query {

    adminPanelKey() {
        return responses.f200Response([ APKey.key ]);
    }

    async checkAdmin(_: any, __: any, { req }: types.AppContext): Promise<types.AuthResponseType> {
        const at = new auth.JWT(req.cookies.a_token);
        const claims = at.decode();

        if (claims.aud == types.RoleEnum.Admin || claims.aud == types.RoleEnum.Superadmin) {
            return responses.f200Response([ true ]);
        }
        
        return responses.f200Response([ false ]);
    }
}

class Mutation {

    // async createAT(
    //     _: any,
    //     __: any,
    //     { req, res, dataSources: { redis } }: types.AppContext
    // ): Promise<types.AuthResponseType> {
    //     const rt = new auth.RefreshToken(req.cookies!.r_token, redis);

    //     await rt.isRegistered();

    //     await rt.revoke();

    //     const claims = rt.decode();
        
    //     await auth.setNewTokensToResponse({ res, redis, userId: claims.sub, role: claims.aud });

    //     return responses.f200Response();
    // }

    async adminLogin(
        _: any,
        { username, password }: types.MutationAdminLoginArgs,
        { dataSources: { db, redis }, res }: types.AppContext
    ): Promise<types.AuthResponseType> {
        const q = await db.getOneByFilter(types.ResourceEnum.Admin, { username, password });

        // if admin not exist
        if(!q.qResult) throw new errors.AdminWasNotFoundError();

        // revoke current RT and give new one
        await auth.setNewTokensToResponse(
            { 
                res, 
                redis, 
                role: types.RoleEnum.Admin,
                userId: nanoid(env("GUEST_ID_LENGTH"))
            }
        );

        return responses.f200Response();
    }

    // revokes admin RT
    async adminLogout(
        _: any, 
        __: any, 
        { req, res, dataSources: { redis } }: types.AppContext
    ): Promise<types.AuthResponseType> {
        const rt = new auth.RefreshToken(req.cookies!.r_token, redis);

        await rt.isRegistered();

        await rt.revoke();

        // revoke current RT and give new one
        await auth.setNewTokensToResponse(
            { 
                res, 
                redis, 
                role: types.RoleEnum.Guest, 
                userId: nanoid(env("GUEST_ID_LENGTH"))
            }
        );

        return responses.f200Response();
    }
}

const resolvers: types.Resolvers = {
    Mutation: new Mutation(),
    Query: new Query()
}

export default resolvers;