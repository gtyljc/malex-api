
// others
import * as types from "./types";
import { jwtVerify } from "jose/jwt/verify"
import * as errors from "./errors";
import { formatFResponse } from "./sources";

// schema
import { defaultFieldResolver } from "graphql";
import { GraphQLSchema } from "graphql"
import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";

const directives = [
    function AuthDirective(schema: GraphQLSchema){
        return mapSchema(
            schema,
            {
                [MapperKind.OBJECT_FIELD](fieldConfig){
                    const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];

                    if(authDirective){
                        const { resolve = defaultFieldResolver } = fieldConfig;
                        const { role } = authDirective; // get "role" directive argument

                        return {
                            ...fieldConfig,
                            resolve: async (source, args, context: types.AppContext, info) => {
                                const secret = new TextEncoder().encode(process.env.API_SECRET);
                                const jwk = await global.crypto.subtle.importKey(
                                    "raw",
                                    secret,
                                    {
                                        name: "HMAC",
                                        hash: "SHA-256"
                                    }, true, [ "verify" ]
                                );

                                try {
                                    if (context.req.headers.authorization) {
                                        const verfified = await jwtVerify<types.JWTHeader>(
                                            context.req.headers.authorization.replace("Bearer ", ""),
                                            jwk
                                        );

                                        if (verfified.payload.aud != role) throw new errors.ClientHasNoPermissions();
                                    }
                                    else throw new errors.AuthorizationHeaderWasNotSpecifiedError();
                                }
                                catch{
                                    return formatFResponse(403, "Unauthorizated request!");
                                }

                                return await resolve(source, args, context, info);
                            }
                        };
                    }
                }
            }
        )
    }
]

export default directives;
