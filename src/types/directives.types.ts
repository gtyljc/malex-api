
export type JWTHeader = {
    alg: "HS256"
}

export type JWTPayload = {
    iss: "malex:api"
    aud: Roles // how is using API
    iat: number // when JWT was issued ( timestamp )
    exp: number // when JWT expires ( timestamp )
    sub?: string // id of user ( was made for admins ) 
}

export type VerifyOptions = {
    algorithms: [ JWTHeader["alg"] ]
    issuer: JWTPayload["iss"],
    audience: Array<JWTPayload["aud"]>,
    requiredClaims: [ "iss", "aud", "iat", "exp" ]
}

export type Roles = "ADMIN" | "USER"