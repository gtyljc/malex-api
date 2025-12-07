
export type JWTHeader = {
    alg: "HS256"
}

export type JWTPayload = {
    iss?: "malex:api"
    exp?: number // how long will JWT work (ISOString)
    aud?: "ADMIN" | "USER" // how is using API
    iat?: number // when JWT was issued (ISOString)
}

export type Roles = "ADMIN" | "USER"