
// resolvers for model "SiteConfig"

import { BaseQueryResolvers, BaseMutationResolvers } from "@src/resource-base";
import * as types from "@src/types";
import * as responses from "@src/responses";
import * as tools from "@src/tools";

const __modelname = "siteConfig";

class SiteConfigQueryResolvers extends BaseQueryResolvers {
    constructor(){
        super(__modelname, { isIterrable: false });
    }

    // only necessary data for frontend about site config
    async contactData(_: any, __: any, { dataSources: { db } }: types.AppContext){
        const config = await tools.getSiteConfig(db.dbConnection.client);

        return responses.f200Response(
            [
                {
                    opening_at: config.opening_at,
                    closing_at: config.closing_at,
                    min_duration: config.min_duration,
                    support_email: config.support_email,
                    phone_number: config.phone_number
                }
            ]
        )
    }
}

const resolvers: types.Resolvers = {
    Query: new SiteConfigQueryResolvers().register().resolvers,
    Mutation: new BaseMutationResolvers(
        __modelname,
        { isDeletable: false, isCreatable: false, isIterrable: false }
    ).register().resolvers
}

export default resolvers;