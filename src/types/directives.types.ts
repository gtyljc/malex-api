
export type JWTHeader = {
    alg: "HS256"
}

export type JWTPayload = {
    iss: "malex:api"
    aud: Roles // how is using API
    iat: number // when JWT was issued ( timestamp )
}

export type VerifyOptions = {
    algorithms: [ JWTHeader["alg"] ]
    issuer: JWTPayload["iss"],
    audience: Array<JWTPayload["aud"]>,
    maxTokenAge: number | string,
    requiredClaims: [ "alg", "iss", "aud" ]
}

export type Roles = "ADMIN" | "USER"