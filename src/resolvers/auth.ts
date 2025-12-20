
import { formatSResponse, formatFResponse } from "../sources";
import * as types from "../types";
import dayjs from "dayjs";
import * as auth from "../auth";
import * as tools from "../tools";

let currentAdminUrl: string; // dynamic url to Admin Panel

// creates pair AT ( access token ) and RT ( refresh token )
// and can be used only if RT exist and not expired
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

    return formatSResponse([ await auth.getAuthPair(claims.aud, db) ]);
}

async function _createRT(
    role: types.Roles, 
    req: types.AppContext["req"], 
    db: types.AppContext["dataSources"]["db"]
) {
    
    // check IP of sender ( it's must be backend or localhost )
    if (!auth.isSentFromBackend(req.socket.remoteAddress)) {
        return formatFResponse(403, "Unauthorizated request!")
    };

    return formatSResponse([ await auth.getAuthPair(role, db) ]);
}

// verify login data from Admin Panel login page, and on success
// returns auth pair, with "ADMIN" role
async function _adminLogin(
    username: string,
    password: string,
    db: types.AppContext["dataSources"]["db"]
): Promise<types.ResponseSchema> {
    const r = (
        await db.getOneByFilter(
            "admins",
            { filter: { username, password, is_logged: false } }
        )
    );

    // if admin not exist
    if(tools.isEmpty(r.data)){
        return formatFResponse(403, "Unauthorizated request!");
    }

    return formatSResponse([ await auth.getAuthPair("ADMIN", db) ]);
}

async function _adminLogout(
    req: types.AppContext["req"], 
    db: types.AppContext["dataSources"]["db"]
) {
    

    return formatSResponse([ await auth.getAuthPair("USER", db) ]);
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
            { role }: { role: types.Roles },
            { req, dataSources: { db } }: types.AppContext
        ) => await _createRT(role, req, db),

        createAT: async(
            _,
            __,
            { req, dataSources: { db } }: types.AppContext
        ) => await _createAT(req, db),
    }
}