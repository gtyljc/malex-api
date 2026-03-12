
// all available types in one file

import * as generated from "./generated.types";
import { DatabaseSource } from "../../sources";
import { createClient } from "redis";
import Cloudflare from "cloudflare";
import { JWTPayload, JWTHeaderParameters } from "jose";
import { IncomingMessage, OutgoingMessage } from "http";

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
    res: OutgoingMessage,
    dataSources: { 
        db: DatabaseSource
        cloudflare: Cloudflare
        redis: ReturnType<typeof createClient>
    }
}
export type Role = "ADMIN" | "USER" | "GUEST" | "SUPERUSER" | "SUPERADMIN";
export interface DefaultPayload extends JWTPayload {
    iss: string,
    sub: string | null,
    aud: Role,
    iat: number,
    exp: number
}
export interface DefaultHeader extends JWTHeaderParameters  {
    alg: string
}
export type DBMethod = (
    "findUnique" |
    "findFirst" | 
    "findMany" | 
    "update" |
    "updateMany" | 
    "delete" | 
    "deleteMany" |
    "count" |
    "create"
);
export type Resource = (
    "appointment" |
    "work" |
    "siteConfig" |
    "admin" |
    "refreshToken"
)
export type GetManyArgs = {
    ids?: string[]
    filter?: Object,
    pagination?: generated.PaginationInput,
    sort?: generated.SortInput
}
export type GetOneArgs = {
    id: string
}
export type UpdateOneArgs = {
    id: string,
    data: Record<string, any>
}
export type UpdateManyArgs = {
    ids: string[],
    data: Record<string, any>
}
export type DeleteOneArgs = {
    id: string
}
export type DeleteManyArgs = {
    ids: string[]
}
export type CreateArgs = {
    data: Record<string, any>
}
export type APIResponse<ResponseType> = {
    data: ResponseType[]
    pagination?: generated.PaginationType
} & generated.ApiResponseInterface

// connect "schema" types
export * from "./generated.types";