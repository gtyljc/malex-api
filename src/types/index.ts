
// all available types in one file

import * as generated from "./generated.types";
import { DatabaseSource } from "../sources";
import { IncomingMessage } from "http";
import Cloudflare from "cloudflare";

// app

export type AppContext = {
    req: IncomingMessage,
    dataSources: { 
        db: DatabaseSource
        cloudflare: Cloudflare
    }
}


// auth

export type JWTHeader = {
    alg: "HS256"
}

export type JWTPayload = {
    iss: "malex:api"
    aud: Roles // how is using API
    iat: number // when JWT was issued ( timestamp )
    exp: number // when JWT expires ( timestamp )
    sub: string // id of user
}

export type VerifyOptions = {
    algorithms: [ JWTHeader["alg"] ]
    issuer: JWTPayload["iss"],
    audience: Array<JWTPayload["aud"]>,
    requiredClaims: [ "iss", "aud", "iat", "exp", "sub" ]
}


// permissions

export type Roles = "ADMIN" | "USER" | "GUEST" | "SUPERUSER" | "SUPERADMIN"


export type Permissions = {
    role: Roles,
    permissions: string[]
}


// source

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


// responses

export type APIResponse<ResponseType> = {
    data: ResponseType[]
    pagination?: generated.PaginationType
} & generated.ApiResponseInterface


// connect "schema" types
export * from "./generated.types";