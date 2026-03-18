
// was made for validation of .env file ( because of it's transfer )

import * as z from "zod";
import * as errors from "./errors";

function parseBoolean(value: string, ctx: z.core.ParsePayload){
    if (value === "true" || value === "1"){
        return true;
    }

    if (value === "false" || value === "0"){
        return false;
    }

    ctx.issues.push(
        {
            code: "custom",
            message: "Not a boolean value!",
            input: value,
        }
    )

    return z.NEVER;
}

const envSchema = z.object(
    {    
        SITE_CONFIG_OPENING_AT: z.iso.time(),
        SITE_CONFIG_CLOSING_AT: z.iso.time(),
        SITE_CONFIG_MIN_DURATION: z.coerce.number(),
        SITE_CONFIG_SUPPORT_EMAIL: z.email(),
        SITE_CONFIG_PHONE_NUMBER: z.string(),
        SITE_CONFIG_TIMEZONE: z.string(),
        SITE_CONFIG_COUNTRY: z.string(),
        DATABASE_URL: z.url(),
        DATABASE_RECONNECT_DELAY: z.coerce.number(),
        CLOUDFLARE_API_TOKEN: z.string(),
        CLOUDFLARE_ACCOUNT_ID: z.string(),
        REDIS_URL: z.url(),
        REDIS_RECONNECT_DELAY: z.coerce.number(),
        BACKEND_ORIGIN: z.url(),
        PER_WINDOW_LIMIT: z.coerce.number(), 
        WINDOW_DURATION: z.coerce.number(),
        LOG_PATH: z.string(),
        LOG_LEVEL: z.enum([ "info", "debug", "error" ]),
        PORT: z.coerce.number(),
        HOSTNAME: z.string(),
        PROTOCOL: z.enum([ "http", "https" ]),
        NODE_ENV: z.enum([ "development", "production" ]),
        PER_PAGE_LIMIT: z.coerce.number(),
        RATE_LIMITER: z.transform(parseBoolean),
        RT_GUEST_ID_LENGTH: z.coerce.number(),
        RT_CREATE_REQUEST_EXPIRATION_DELAY: z.coerce.number(),
        RT_CREATE_REQUEST_HASH_FUNC: z.coerce.string(),
        RT_CREATE_REQUEST_ENCODING: z.coerce.string(), 
        RT_CREATE_REQUEST_SECRET: z.string(),
        API_SIGN_SECRET: z.string(),
        API_PASSWORD_PEPPER: z.string(),
        REFRESH_TOKEN_EXPIRATION_DELAY: z.coerce.number(),
        ACCESS_TOKEN_EXPIRATION_DELAY: z.coerce.number(),
        JWT_DEFAULT_ISSUER: z.string(),
        JWT_DEFAULT_VERSION: z.string(),
        AUTHENTICATION: z.transform(parseBoolean),
        USER_ID_LENGTH: z.coerce.number(),
        ADMIN_PANEL_KEY_REFRESH_DELAY: z.coerce.number()        
    }
);

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success){
    throw new errors.EnviromentFileParsingError(parsedEnv.error);
}

export { envSchema, parsedEnv };