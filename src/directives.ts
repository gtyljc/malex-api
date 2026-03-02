
// others
import * as types from "./types";
import { hasPermission } from "./permissions";
import * as auth from "./auth";
import { decodeJwt } from "jose";
import * as utils from "@lib/utils";
import { env } from "@lib/utils";

// schema
import { defaultFieldResolver } from "graphql";
import { GraphQLSchema } from "graphql"
import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";
import { ResolverSaveCatch } from "@lib/utils";
import * as errors from "@src/errors";

class AuthDirectiveResolver{
    fieldName: string;
    baseResolver: Function;

    constructor(
        { fieldName, baseResolver }: 
        { fieldName: string, baseResolver: Function }
    ) {
        this.fieldName = fieldName;
        this.baseResolver = baseResolver;
    }

    // must be "binded"
    @ResolverSaveCatch
    async resolve(...args: any[]){
        const ctx = args[2];
        const authChecks = [

            // check if jwt was specified
            ({ ctx }: { ctx: types.AppContext }) => {
                return [ ctx.req.headers.authorization, ctx.req.headers.authorization ]
            },
            
            // validate jwt
            async ({ next }: { next: string }) => {
                const jwt = utils.getJWTFromHeader(next);
                const isValid = await auth.validateJWT(jwt);

                return [ isValid, isValid && jwt ] ;
            },

            // checks if user has permissions on execution
            ({ next }: { next: string }) => {
                const claims = decodeJwt(next);
                
                return [ hasPermission(claims.aud as types.Roles, this.fieldName) ];
            }
        ];

        if (env("AUTHENTICATION") && !utils.validate(authChecks, { ctx })){
            throw new errors.NotAuthenticatedRequestError();
        }

        let r = this.baseResolver(...args);

        if (r instanceof Promise) r = await r;

        return r;
    }
}

const directives = [
    function AuthDirective(schema: GraphQLSchema){
        return mapSchema(
            schema,
            {
                [MapperKind.OBJECT_FIELD](fieldConfig){
                    const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];

                    if(authDirective){
                        const { resolve = defaultFieldResolver, astNode: { name } } = fieldConfig;
                        const authDirectiveResolver = new AuthDirectiveResolver({ fieldName: name.value, baseResolver: resolve });

                        return { 
                            ...fieldConfig, 
                            resolve: authDirectiveResolver.resolve.bind(authDirectiveResolver)
                        }
                    };
                }
            }
        )
    }
]

export default directives;
