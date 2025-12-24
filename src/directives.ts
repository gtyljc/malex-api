
// others
import * as types from "./types";
import * as responses from "./responses";
import { hasPermission } from "./permissions";
import * as auth from "./auth";

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
                        const { role } = authDirective; // get "role" directive argument

                        return {
                            ...fieldConfig,
                            resolve: async (source, args, context: types.AppContext, info) => {

                                // check if header "Authorization" was specified
                                if(context.req.headers.authorization){
                                    const jwt = auth.getJWTFromHeader(context.req.headers.authorization);
                                    const validated = await auth.validateJWT(jwt);

                                    // user must have role that was specified at schema
                                    // and also role has permissions on this field execution
                                    if(validated && hasPermission(validated.payload.aud as types.Roles, name.value)){           
                                        return await resolve(source, args, context, info);
                                    }
                                }

                                return responses.f403Response();
                            }
                        };
                    }
                }
            }
        )
    }
]

export default directives;
