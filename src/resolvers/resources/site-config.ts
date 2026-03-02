
// resolvers for model "SiteConfig"

import { BaseQueryResolvers, BaseMutationResolvers } from "@src/resource-base";
import * as types from "@src/types";
import * as responses from "@src/responses";
import * as utils from "@lib/utils";
import { ResolverSaveCatch } from "@lib/utils";

const __modelname = "siteConfig";

class Query extends BaseQueryResolvers {
    constructor(){
        super(__modelname, { isIterrable: false });
    }

    // only necessary data for frontend about site config
    @ResolverSaveCatch
    async publicConfig(
        _: any, 
        __: any,
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<types.PublicConfigResponseType>> {
        const config = await utils.getSiteConfig(db);

        return responses.f200Response(
            [
                {
                    opening_at: config.opening_at,
                    closing_at: config.closing_at,
                    min_duration: config.min_duration,
                    support_email: config.support_email,
                    phone_number: config.phone_number,
                    c_country: config.c_country,
                    timezone: config.timezone
                }
            ]
        )
    }
}

const resolvers: types.Resolvers = {
    Query: new Query().register().resolvers,
    Mutation: new BaseMutationResolvers(
        __modelname,
        { isDeletable: false, isCreatable: false, isIterrable: false }
    ).register().resolvers
}

export default resolvers;