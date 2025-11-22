
// resolvers for model "Config"

import { BaseQueryResolvers, BaseMutationResolvers } from "./base.js";

const __modelname = "adminConfig";

export default {
    Query: new BaseQueryResolvers(
        __modelname, { isIterrable: false }
    ).resolvers,
    Mutation: {
        ...new BaseMutationResolvers(
            __modelname,
            { isDeletable: false, isCreatable: false, isIterrable: false }
        ).resolvers,
        
    }
}