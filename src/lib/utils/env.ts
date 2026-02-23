
import * as z from "zod";

export const parsedEnv = z.object(
    {
        LOG_PATH: z.string(),
        
        SITE_CONFIG_OPENING_AT: z.iso.datetime(),
        SITE_CONFIG_CLOSING_AT: z.iso.datetime(),
        SITE_CONFIG_MIN_DURATION: z.coerce.number(),
        SITE_CONFIG_SUPPORT_EMAIL: z.email(),
        SITE_CONFIG_PHONE_NUMBER: z.string(),
        SITE_CONFIG_TIMEZONE: z.string(),
        SITE_CONFIG_COUNTRY: z.string(),

        DATABASE_URL: z.url(),
        DATABASE_RECONNECTION_DELAY: z.coerce.number(),

        CLOUDFLARE_API_TOKEN: z.string(),
        CLOUDFLARE_ACCOUNT_ID: z.string(),

        PORT: z.string(),
        NODE_ENV: z.enum([ "development", "production" ]),
        PER_PAGE_LIMIT: z.coerce.number(),

        API_SECRET: z.string(),
        REFRESH_TOKEN_EXPIRATION_DELAY: z.coerce.number(),
        ACCESS_TOKEN_EXPIRATION_DELAY: z.coerce.number(),

        AUTHENTICATION: z.coerce.boolean(),

        USER_ID_LENGTH: z.coerce.number(),

        ADMIN_PANEL_KEY_REFRESH_DELAY: z.coerce.number()        
    }
).safeParse(process.env);