
import * as responses from "@src/responses";
import * as types from "@lib/types";
import * as auth from "@src/auth";
import { decodeJwt } from "jose";
import { ResolverSaveCatch } from "@lib/utils";

class Query {
    
    @ResolverSaveCatch
    async checkAdmin(...args: any[]) {
        return responses.f200Response();
    }
}

class Mutation {

    @ResolverSaveCatch
    async createAT(
        _,
        __,
        { req, res, dataSources: { redis } }: types.AppContext
    ): Promise<types.APIResponse<types.JwtType>> {
        const rt = new auth.RefreshToken(req.cookies!.a_token, redis);

        await rt.isRegistered();

        await rt.revoke();

        const claims = decodeJwt<types.DefaultPayload>(rt.jwt);
        
        await auth.responseWithTokens({ res, redis, userId: claims.sub, role: claims.aud });

        return responses.f200Response();
    }

    @ResolverSaveCatch
    async adminLogin(
        _,
        { username, password }: types.MutationAdminLoginArgs,
        { dataSources: { db } }: types.AppContext
    ){
        const q = await db.getOneByFilter("admin", { username, password });

        // if admin not exist
        if(!q.qResult) return responses.f403Response();

        return responses.f200Response();
    }

    // revokes admin RT
    @ResolverSaveCatch
    async adminLogout(_, __, { req, res, dataSources: { db, redis } }: types.AppContext) {
        const at = auth.JWT.getJWTFromHeader(req.headers.authorization as string);
        const rt = await auth.RefreshToken.searchByAT(at, db);
        
        if(!rt) return responses.f403Response();

        await rt.revoke();

        // revoke current RT and give new one
        await auth.responseWithTokens({ res, redis, userId: null, role: "GUEST" });

        return responses.f200Response();
    }
}

const resolvers: types.Resolvers = {
    Mutation: new Mutation(),
    Query: new Query()
}

export default resolvers;