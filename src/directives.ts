
// others
import { hasPermission } from "./permissions";
import { JWT } from "@src/auth";
import * as types from "@lib/types";
import * as z from "zod";
import * as errors from "@lib/errors";
import { env } from "@lib/utils";

// schema
import { defaultFieldResolver } from "graphql";
import { GraphQLSchema } from "graphql"
import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";

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
    async resolve(...args: any[]): Promise<types.APIResponse<any> | void> {
        const ctx: types.AppContext = args[2];
        const req = ctx.req;

        if (!env("AUTHENTICATION")) { return await this.runBaseResolver(...args) }

        // auth for backend ( SUPERUSER )
        if (req.headers.authorization){
            const jwtClaims = await JWT.getFromHeader(req.headers.authorization).validate();

            if(jwtClaims.payload.aud != "SUPERUSER"){
                throw new errors.ClientIsNotSuperUserError();
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
            throw new errors.NoCredentialsAtRequestError();
        }

        const jwtClaims = await new JWT(parsedCookies.data.a_token).validate();

        if (hasPermission(jwtClaims.payload.aud, this.fieldName)){
            return await this.runBaseResolver(...args);
        }

        throw new errors.NotAuthenticatedRequestError();
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
