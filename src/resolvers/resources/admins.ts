
import * as responses from "@src/responses";
import * as types from "@src/types";
import * as auth from "@src/auth";
import * as utils from "@lib/utils";
import { decodeJwt } from "jose";
import { ASyncResolverSaveCatch } from "@lib/utils";
import logger from "@lib/logger";

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
        logger.info(`Admin Panel available at http://localhost:3000/admin?key=${ this.currentValue }`)
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
    
    @ASyncResolverSaveCatch
    adminPanelKey() {
        return responses.f200Response([ APKey.key ]);
    }
}

class Mutation {

    @ASyncResolverSaveCatch
    async adminLogin(
        _,
        { username, password }: types.MutationAdminLoginArgs,
        { dataSources: { db } }: types.AppContext
    ){
        const q = await db.getOneByFilter("admin", { username, password });

        // if admin not exist
        if(!q.qResult) return responses.f403Response();

        return responses.f200Response(
            [ 
                await auth.createPair(
                    { db, role: "ADMIN", userId: q.qResult.user.id }
                ) 
            ]
        );
    }

    // revokes admin RT
    @ASyncResolverSaveCatch
    async adminLogout(_, __,{ req, dataSources: { db } }: types.AppContext) {
        const at = utils.getJWTFromHeader(req.headers.authorization as string);
        const rt = (await auth.RefreshToken.searchByAT(at, db))?.jwt;
        
        if(!rt) return responses.f403Response();

        // revoke current RT and give new one
        const claims = decodeJwt(rt);

        return responses.f200Response(
            [ 
                await auth.createPair(
                    { db, role: claims.aud as types.Roles, userId: claims.sub as string }
                ) 
            ]
        );
    }
}

const resolvers: types.Resolvers = {
    Query: new Query(),
    Mutation: new Mutation()
}

export default resolvers;