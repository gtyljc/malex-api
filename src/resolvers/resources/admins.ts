
import * as responses from "@src/responses";
import * as types from "@src/types";
import * as auth from "@src/auth";
import * as tools from "@src/tools";
import { decodeJwt } from "jose";

var adminPanelKey: string;

function updateAdminPanelKey(){
    adminPanelKey = crypto.randomUUID();

    console.log(`http://localhost:3000/admin?key=${adminPanelKey}`);
}

// initialization of Admin Panel key
updateAdminPanelKey();

setInterval(updateAdminPanelKey, parseInt(process.env.ADMIN_PANEL_KEY_REFRESH_DELAY!));

const resolvers: types.Resolvers = {
    Query: {
        adminPanelKey: async () => {
            return responses.f200Response([ adminPanelKey ]);
        }
    },
    
    Mutation: {
        adminLogin: async(
            _,
            { username, password }: types.MutationAdminLoginArgs,
            { dataSources: { db } }: types.AppContext
        ) => {
            const q = await db.getOneByFilter("admin", { username, password, is_logged: false });

            // if admin not exist
            if(!q.qResult) return responses.f403Response();

            // set flag as logged in DB
            await db.updateById("admin", q.qResult.id, { is_logged: true });

            return responses.f200Response([ await auth.createAuthTokens(q.qResult.user_id, "ADMIN", db) ]);
        },

        // revokes admin 
        adminLogout: async(
            _,
            __,
           { req, dataSources: { db } }: types.AppContext
        ) => {
            const at = tools.getJWTFromHeader(req.headers.authorization as string);
            const rt = (await auth.RefreshToken.searchByAT(at, db))?.jwt;
            
            if(!rt) return responses.f403Response();

            // revoke current RT and give new one
            const claims = decodeJwt(rt);

            // reset flag is_logged
            await db.updateById("admin", claims.sub as string, { is_logged: false });

            return responses.f200Response([ await auth.createAuthTokens(claims.sub, claims.aud as types.Roles, db) ]);
        }
    }
}

export default resolvers;