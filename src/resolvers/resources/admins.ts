
import * as responses from "@src/responses";
import * as types from "@lib/types";
import * as utils from "@lib/utils";
import { ResolverSaveCatch } from "@lib/utils";
import logger from "@lib/logger";
// import loadArgon2idWasm from 'argon2id';

class AdminPanelKey {
    private currentValue: string;

    constructor(){
        this.currentValue = this.init();
    }

    get key(){
        return this.currentValue;
    }

    updateCurrentValue(){
        this.currentValue = crypto.randomUUID();
    }

    logCurrentValue(){
        logger.info(`Admin Panel available at http://localhost:3000/admin?key=${ this.currentValue }`)
    }

    private init(){
        if (utils.env("NODE_ENV") != "development"){
            
            // update key with specified delay in .env
            setInterval(
                () => { this.updateCurrentValue(); this.logCurrentValue() }, 
                utils.env("ADMIN_PANEL_KEY_REFRESH_DELAY")
            );
        }

        return crypto.randomUUID();
    }
}

const APKey = new AdminPanelKey();

class Query {
    
    @ResolverSaveCatch
    adminPanelKey() {
        return responses.f200Response([ APKey.key ]);
    }
}

const resolvers: types.Resolvers = {
    Query: new Query()
}

export default resolvers;