
// resolvers for model "SiteConfig"

import { BaseQueryResolvers, BaseMutationResolvers } from "@src/resource-base";
import * as types from "@src/types";

const __modelname = "siteConfig";

class SiteConfigQueryResolvers extends BaseQueryResolvers {
    
    // all necessary data for frontend about site config
    contactData(){
        async function inner(_, __, { dataSources: { db } }: types.AppContext) {
            return await db.getOneById(__modelname, "1");
        }

        return inner;
    }
}

const resolversSchema: types.ResolversSchema = {
    Query: {
        ...new SiteConfigQueryResolvers(
            __modelname, { isIterrable: false }
        ).register().resolvers
    },
    Mutation: {
        ...new BaseMutationResolvers(
            __modelname,
            { isDeletable: false, isCreatable: false, isIterrable: false }
        ).register().resolvers,
    }
}

export default resolversSchema;