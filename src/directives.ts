
// others
import { hasPermission } from "./permissions";
import { decodeJwt } from "jose";
import { validateJWT, JWT } from "@src/auth";
import * as responses from "@src/responses";
import * as types from "@lib/types";
import * as z from "zod";

// schema
import { defaultFieldResolver } from "graphql";
import { GraphQLSchema } from "graphql"
import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";
import { ResolverSaveCatch } from "@lib/utils";

interface DirectiveResolverParams {
    fieldName: string,
    baseResolver: Function
}

class DirectiveResolver {
    fieldName: string;
    baseResolver: Function;

    constructor(
        { fieldName, baseResolver }: 
        DirectiveResolverParams
    ) {
        this.fieldName = fieldName;
        this.baseResolver = baseResolver;
    }
    
    async runBaseResolver(...args: any[]) {
        let r = this.baseResolver(...args);

        if (r instanceof Promise) r = await r;

        return r;
    }
}

class AuthDirectiveResolver extends DirectiveResolver {

    // must be "binded"
    @ResolverSaveCatch
    async resolve(...args: any[]): Promise<types.APIResponse<any>> {
        const ctx: types.AppContext = args[2];
        const req = ctx.req;

        // auth for backend ( SUPERUSER )
        if (req.headers.authorization){
            const jwt = JWT.getJWTFromHeader(req.headers.authorization);

            await validateJWT(jwt);

            const jwtClaims = decodeJwt<types.DefaultPayload>(jwt);

            if(jwtClaims.aud != "SUPERUSER"){
                return responses.f403Response();
            }

            return await this.runBaseResolver(...args);
        }

        // all next logic is for simple user
        const cookiesSchema = z.object(
            {
                a_token: z.jwt(),
                r_token: z.jwt()
            }
        )
        const parsedCookies = cookiesSchema.safeParse(req.cookies);

        if (!parsedCookies.success){
            return responses.f400Response();
        }

        const jwt = parsedCookies.data.a_token;
        const jwtClaims = decodeJwt<types.DefaultPayload>(jwt);

        if (await validateJWT(jwt) && hasPermission(jwtClaims.aud, this.fieldName)){
            return await this.runBaseResolver(...args);
        }

        return responses.f403Response();
    }
}

const directives = [
    function AuthDirective(schema: GraphQLSchema){
        return mapSchema(
            schema,
            {
                [MapperKind.OBJECT_FIELD](fieldConfig, fieldName){
                    const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];

                    if(authDirective){
                        const { resolve = defaultFieldResolver } = fieldConfig;
                        const authDirectiveResolver = new AuthDirectiveResolver({ fieldName, baseResolver: resolve });

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
