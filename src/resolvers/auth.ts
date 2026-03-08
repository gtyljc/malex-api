
import * as responses from "@src/responses";
import * as types from "@lib/types";
import * as auth from "@src/auth";
import { serializeCookie } from "@lib/utils";
import { decodeJwt } from "jose";

const resolvers: types.Resolvers = {
    Mutation: {

        createAT: async(
            _,
            __,
            { req, res, dataSources: { redis } }: types.AppContext
        ): Promise<types.APIResponse<types.JwtType>> => {
            const rt = new auth.RefreshToken(req.cookies.a_token,  redis);

            await rt.isRegistered();

            await rt.revoke();

            const claims = decodeJwt<types.DefaultPayload>(rt.jwt);
            const newPair = await auth.createPair(redis, { userId: claims.sub, role: claims.aud });

            // set new cookies
            res.setHeader(
                "Set-Cookie",
                [
                    serializeCookie("a_token", newPair.at),
                    serializeCookie("r_token", newPair.rt)
                ]
            );

            return responses.f200Response();
        }
    }
}

export default resolvers;