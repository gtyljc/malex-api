
import { formatSResponse } from "../sources";
import * as types from "../types";
import { SignJWT } from "jose";
import dayjs from "dayjs";

export default {
    Mutation: {
        
        // this mutation can be used only by Malex backend
        async createJWT(_, { role }: { role: types.Roles }, { req }: types.AppContext){

            // console.log(req.socket.remoteAddress)

            // check IP of sender
            // if (req.socket.remoteAddress != process.env.BACKEND_IP);

            const secret = new TextEncoder().encode(process.env.API_SECRET);
            const payload: types.JWTPayload = {
                aud: role,
                exp: dayjs().add(2, "hour").unix(),
                iat: dayjs().unix(),
                iss: "malex:api"
            };
            const header: types.JWTHeader = {
                alg: "HS256"
            }
            const jwt = new SignJWT(payload).setProtectedHeader(header);

            return formatSResponse([{ token: await jwt.sign(secret) }]);
        }
    }
}