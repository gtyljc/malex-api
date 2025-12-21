
import { formatSResponse, formatFResponse } from "../sources";
import * as types from "../types";
import * as auth from "../auth";
import * as tools from "../tools";
import { nanoid } from "nanoid";

let currentAdminUrl: string; // dynamic url to Admin Panel

// NEEDS RT
// creates new pair AT and RT and can be used only if RT exist and not expired;
// all claims will taken from old one and translated to new one
async function _createAT(
    req: types.AppContext["req"], 
    db: types.AppContext["dataSources"]["db"]
): Promise<types.ResponseSchema> {
    const rt = auth.getJWTFromHeader(req.headers.authorization);
    const claims = await auth.isRTExist(rt, db);

    // check if token exist
    if (!claims){
        return formatFResponse(403, "Unauthorizated request!")
    }

    // revoke current RT and give new one
    await auth.revokeRT(rt, db);

    return formatSResponse([ await auth.getAuthPair(claims.sub, claims.aud, db) ]);
}

// NEEDS IP
// creates new pair AT and RT and can be used only by backend;
// must to be used as first auth pair or if old RT is expired
// and client needs new one
async function _createRT(
    user_id: string,
    role: types.Roles, 
    req: types.AppContext["req"], 
    db: types.AppContext["dataSources"]["db"]
) {

    // check IP of sender ( it's must be backend or localhost )
    if (!auth.isSentFromBackend(req.socket.remoteAddress)) {
        return formatFResponse(403, "Unauthorizated request!")
    };

    return formatSResponse([ await auth.getAuthPair(user_id, role, db) ]);
}

// NEEDS AT
// verify user data from Admin Panel login page; on success
// returns auth pair, with "ADMIN" role
async function _adminLogin(
    username: string,
    password: string,
    db: types.AppContext["dataSources"]["db"]
): Promise<types.ResponseSchema> {    
    const r = (await db.getOneByFilter("admin", { username, password, is_logged: false }));

    // if admin not exist
    if(tools.isEmpty(r.data)){
        return formatFResponse(403, "Unauthorizated request!");
    }

    return formatSResponse([ await auth.getAuthPair(r.data[0].user_id, "ADMIN", db) ]);
}

// NEEDS AT
// revokes RT with "ADMIN" role and returns auth pair with "USER" role
async function _adminLogout(
    req: types.AppContext["req"], 
    db: types.AppContext["dataSources"]["db"]
) {
    const at = auth.getJWTFromHeader(req.headers.authorization);

    // revoke current RT and give new one
    await auth.revokeRT(at, db);

    return formatSResponse([ await auth.getAuthPair(nanoid(10), "GUEST", db) ]);
}

export default {
    Mutation: {

        adminLogin: async(
            _,
            { username, password }: { username: string, password: string },
            { dataSources: { db } }: types.AppContext
        ) => await _adminLogin(username, password, db),

        adminLogout: async(
            _,
            __,
           { req, dataSources: { db } }: types.AppContext
        ) => await _adminLogout(req, db),
    
        createRT: async(
            _,
            { user_id, role }: { user_id: string, role: types.Roles },
            { req, dataSources: { db } }: types.AppContext
        ) => await _createRT(user_id, role, req, db),

        createAT: async(
            _,
            __,
            { req, dataSources: { db } }: types.AppContext
        ) => await _createAT(req, db),
    }
}