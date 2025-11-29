
// others
import * as types from "./types/index.ts";
import { jwtVerify } from "jose/jwt/verify"

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
                    const authDirective = getDirective(schema, fieldConfig, "auth");

                    if(authDirective){
                        const { resolve = defaultFieldResolver } = fieldConfig;

                        return {
                            ...fieldConfig,
                            resolve: async (source, args, context: types.AppContext, info) => {
                                const enc = new TextEncoder();
                                const jwk = await global.crypto.subtle.importKey(
                                    "raw",
                                    enc.encode(process.env.API_SECRET),
                                    {
                                        name: "HMAC",
                                        hash: "SHA-256"
                                    }, true, [ "verify" ]
                                );
                                const jwt = await jwtVerify<types.JWTHeader>(
                                    context.req.headers.authorization.replace("Bearer ", ""),
                                    jwk
                                )
                                const result = await resolve(source, args, context, info);
                            }
                        };
                    }
                }
            }
        )
    }
]

export default directives;
