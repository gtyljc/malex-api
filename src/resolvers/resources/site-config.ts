
// resolvers for model "SiteConfig"

import { BaseQueryResolvers, BaseMutationResolvers } from "@src/resource-base";
import * as types from "@src/types";
import { DatabaseSource } from "@src/sources";

const __modelname = "siteConfig";

// returns full config of site
export async function getConfig(db: DatabaseSource){
    return await db.getOneById("siteConfig", "1");
}

class SiteConfigQueryResolvers extends BaseQueryResolvers {

    // all necessary data for frontend about site config
    contactData(){
        async function inner(_, __, { dataSources: { db } }: types.AppContext) {
            return (await getConfig(db)).apiResponse;
        }

        return inner;
    }
}

const resolvers: types.Resolvers = {
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

export default resolvers;