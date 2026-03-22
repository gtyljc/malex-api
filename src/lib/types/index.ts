
// all available types in one file

import * as generated from "./generated/generated.types";
import { DatabaseSource } from "../../sources";
import { createClient } from "redis";
import Cloudflare from "cloudflare";
import { IncomingMessage, ServerResponse } from "http";

interface Cookies {
    a_token: string,
    r_token: string
}

interface AppRequest extends IncomingMessage {
    cookies: Cookies | undefined,
    body: Record<string, any>
}

export type AppContext = {
    req: AppRequest,
    res: ServerResponse,
    dataSources: { 
        db: DatabaseSource
        cloudflare: Cloudflare
        redis: ReturnType<typeof createClient>
    }
}

export type APIResponse<ResponseType = any> = {
    data: ResponseType[]
    pagination?: generated.PaginationType
} & generated.ApiResponseInterface

// connect "schema" types
export * from "./generated/generated.types";