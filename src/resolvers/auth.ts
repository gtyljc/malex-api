
import * as responses from "@src/responses";
import * as types from "@src/types";
import * as auth from "@src/auth";
import * as utils from "@lib/utils";
import { decodeJwt } from "jose";

const resolvers: types.Resolvers = {
    Mutation: {

        // creates referesh token, that is needed to get new acess token;
        // access to this field has only backend
        createRT: async(
            _,
            { user_id, role }: types.MutationCreateRtArgs,
            { req, dataSources: { db } }: types.AppContext
        ): Promise<types.APIResponse<types.JwtType>> => {

            // check IP of sender ( it's must be backend or localhost )
            if (!utils.isSentFromBackend(req.socket.remoteAddress as string)) return responses.f403Response();

            return responses.f200Response([ await auth.createPair({ db, userId: user_id, role }) ]);
        },

        createAT: async(
            _,
            __,
            { req, dataSources: { db } }: types.AppContext
        ): Promise<types.APIResponse<types.JwtType>> => {
            const rt = new auth.RefreshToken(utils.getJWTFromHeader(req.headers.authorization as string), db);

            // check if refresh token exist
            if (!await rt.isRegistered()) return responses.f403Response();

            // revoke current RT and give new one
            await rt.revoke();

            const claims = decodeJwt(rt.jwt);

            return responses.f200Response(
                [ 
                    await auth.createPair(
                        { db, userId: claims.sub!, role: claims.aud as types.Roles }
                    ) 
                ]
            );
        }
    }
}

export default resolvers;