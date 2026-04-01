
// resolvers for model "SiteConfig"

import { BaseQueryResolvers, BaseMutationResolvers } from "@src/resource";
import * as types from "@lib/types";
import * as responses from "@lib/responses";
import * as utils from "@lib/utils";
import logger from "@lib/logger";

const __modelname = types.ResourceEnum.SiteConfig;

class Query extends BaseQueryResolvers<types.SiteConfigType> {
    constructor(){
        super(__modelname, { isIterrable: false });
    }

    // only necessary data for frontend about site config
    async publicConfig(
        _: any, 
        __: any,
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<types.PublicConfigResponseType>> {
        logger.info("sosi")
        
        const config = await utils.getSiteConfig(db);

        logger.info(config);

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