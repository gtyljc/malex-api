
// others
import * as types from "./types";
import * as responses from "./responses";
import { hasPermission } from "./permissions";
import * as auth from "./auth";
import { decodeJwt } from "jose";
import * as utils from "@lib/utils";

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
                        const { resolve = defaultFieldResolver, astNode: { name } } = fieldConfig;
                        // const { role } = authDirective; // get "role" directive argument

                        return {
                            ...fieldConfig,
                            resolve: async (source, args, ctx: types.AppContext, info) => {
                                const mustBeAuthenticated = parseInt(process.env.AUTHENTICATION!);

                                if (
                                    mustBeAuthenticated && !utils.validate(
                                        [

                                            // check if jwt was specified
                                            ({ ctx }: { ctx: types.AppContext }) => {
                                                if (ctx.req.headers.authorization){
                                                    [ true, ctx.req.headers.authorization ]
                                                }
                                                else [ false, undefined ]
                                            },
                                            
                                            // validate jwt
                                            async ({ next }: { next: string }) => {
                                                const jwt = utils.getJWTFromHeader(next);
                                                const isValid = await auth.jwt.validate(jwt);

                                                return [ isValid, isValid && jwt ] ;
                                            },

                                            // checks if user has permissions on execution
                                            ({ next }: { next: string }) => {
                                                const claims = decodeJwt(next);
                                                
                                                return [ hasPermission(claims.aud as types.Roles, name.value) ];
                                            }
                                        ],
                                        { ctx }
                                    )
                                ){
                                    return responses.f403Response();
                                }

                                return await resolve(source, args, ctx, info);
                            }
                        };
                    }
                }
            }
        )
    }
]

export default directives;
