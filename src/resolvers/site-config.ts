
// resolvers for model "Config"

import { BaseQueryResolvers, BaseMutationResolvers } from "./base";
import * as types from "../types";

const __modelname = "siteConfig";

// returns object with contact data, that includes for instance
// support email, contact phone number, closing and opening at infos, etc.
async function _contactData(db: types.AppContext["dataSources"]["db"]){
    return await db.getOne(__modelname, "1");
}

const resolversSchema: types.ResolversSchema = {
    Query: {
        ...new BaseQueryResolvers(
            __modelname, { isIterrable: false }
        ).resolvers,
        
        contactData: async (_, __, { dataSources: { db } }: types.AppContext) => await _contactData(db)
    },
    Mutation: {
        ...new BaseMutationResolvers(
            __modelname,
            { isDeletable: false, isCreatable: false, isIterrable: false }
        ).resolvers,
    }
}

export default resolversSchema;