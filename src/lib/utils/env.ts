
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
        DATABASE_RECONNECTION_DELAY: z.coerce.number(),

        CLOUDFLARE_API_TOKEN: z.string(),
        CLOUDFLARE_ACCOUNT_ID: z.string(),

        BACKEND_ORIGIN: z.url(),
        PER_WINDOW_LIMIT: z.coerce.number(), 
        WINDOW_DURATION: z.coerce.number(),
        LOG_PATH: z.string(),
        LOG_LEVEL: z.enum([ "info", "debug", "error" ]),
        BASE_URL: z.url(),
        NODE_ENV: z.enum([ "development", "production" ]),
        PER_PAGE_LIMIT: z.coerce.number(),
        RATE_LIMITER: z.transform(parseBoolean),

        API_SECRET: z.string(),
        REFRESH_TOKEN_EXPIRATION_DELAY: z.coerce.number(),
        ACCESS_TOKEN_EXPIRATION_DELAY: z.coerce.number(),

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