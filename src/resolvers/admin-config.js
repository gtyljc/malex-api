
// resolvers for model "Config"

import { BaseQueryResolvers, BaseMutationResolvers } from "./base.js";

const __modelname = "adminConfig";

export default {
    Query: {
        ...new BaseQueryResolvers(
            __modelname, { isIterrable: false }
        ).resolvers,
        
        // returns object with contact data, that includes for instance
        // support email, contact phone number, closing and opening at infos, etc.
        async contactData(_, __, { dataSources }){
            return dataSources.db.getOne("adminConfig", { id: 1 });
        }
    },
    Mutation: {
        ...new BaseMutationResolvers(
            __modelname,
            { isDeletable: false, isCreatable: false, isIterrable: false }
        ).resolvers,
        
    }
}