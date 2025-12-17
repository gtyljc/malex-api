
import { formatSResponse, formatFResponse } from "../sources";
import * as types from "../types";
import { decodeJwt } from "jose";
import dayjs from "dayjs";
import * as auth from "../auth";

let currentAdminUrl: string; // dynamic url to Admin Panel

// this mutation can be used only by Malex backend;
// creates JWT token
async function createAT(
    role: types.Roles, 
    req: types.AppContext["req"], 
    db: types.AppContext["dataSources"]["db"]
): Promise<types.ResponseSchema> {

    // check IP of sender ( it's must be backend or localhost )
    if (!auth.isSentFromBackend(req.socket.remoteAddress)) {
        return formatFResponse(403, "Unauthorizated request!")
    };

    const rt = auth.getJWTFromHeader(req.headers.authorization);
    const [ header, payload, sign ] = rt.split(".");

    // check if token exist
    if ((await db.getManyByFilter("refreshToken", { sign, is_revoked: false }, { page: 1, perPage: 1 })).data[0]){

    }

    // mark refresh toket as revoked
    await db.updateManyByFilter("refreshToken", { sign }, { is_revoked: true })

    return formatSResponse([ await auth.getRTAndATPair(role, db) ]);
}

// verify login data from admin login page
async function adminLogin(
    username: string,
    password: string,
    req: types.AppContext["req"],
    db: types.AppContext["dataSources"]["db"]
): Promise<types.ResponseSchema> {
    const r = (await db.getOneByFilter("admins", { filter: { username, password, is_logged: false } })).data;

    // if admin exist
    if(r.length == 1){
        
        // // set is_logged flag to true
        // await db.updateOne("admins", r.data[0].id, { is_logged: true });

        return formatSResponse([ await createAT("ADMIN", req, db) ])
    }

    return formatFResponse(403, "Unauthorizated request!");
}

// async function refreshJWT(req: types.AppContext["req"]) {
//     const jwt = auth.getJWTFromHeader(req.headers.authorization);
//     const claims = decodeJwt<types.JWTPayload>(jwt);
//     const header: types.JWTHeader = { alg: "HS256" };

//     // reset expiration time range
//     claims.iat = dayjs().unix();
//     claims.exp = dayjs().add(parseInt(process.env.TOKEN_EXPIRATION_DELAY), "hours").unix();

//     return formatSResponse([{ token: await auth.generateJWT(claims, header) }]);
// }

export default {
    Mutation: {
        
        createJWT: async(
            _, 
            { role }: { role: types.Roles }, 
            { req, dataSources: { db } }: types.AppContext
        ) => await createAT(role, req, db),

        adminLogin: async(
            _,
            { username, password }: { username: string, password: string },
            { req, dataSources: { db } }: types.AppContext
        ) => await adminLogin(username, password, req, db),
    
        // refreshJWT: async(
        //     _,
        //     __,
        //     { req }: types.AppContext
        // ) => await refreshJWT(req)
    }
}