
// resolvers for model "Work"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource";
import * as types from "@lib/types";
import * as errors from "@lib/errors";
import * as responses from "@lib/responses";
import { env } from "@lib/utils";
import { ResolverSaveCatch } from "@lib/utils";

const __modelname = "work";

class Query extends BaseQueryResolvers<types.WorkType> {
    constructor(){
        super(__modelname);
    }

    @ResolverSaveCatch
    async newWorks(
        _: any, 
        { num }: types.QueryNewWorksArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<types.PublicWorkType>> {

        // pagination limitation
        if (num > env("PER_PAGE_LIMIT")){
            throw new errors.PaginationLimitError()
        }
        
        const q = await db.getManyByFilter(__modelname, {}, { page: 1, perPage: num });

        q.apiResponse.data = q.qResult.map(
            e => (
                { 
                    img_url: e.img_url, 
                    category: e.category, 
                    timestamp: e.timestamp 
                } 
            )
        );

        return q.apiResponse;
    }

    @ResolverSaveCatch
    async getWorks(
        _: any,
        args: types.QueryGetWorksArgs, 
        ctx: types.AppContext
    ): Promise<types.APIResponse<types.PublicWorkType>> {
        const q = await ctx.dataSources.db.getManyByFilter(__modelname, args.filter);

        return responses.f200Response(
            q.qResult.map(
                e => (
                    {
                        img_url: e.img_url,
                        category: e.category,
                        timestamp: e.timestamp
                    }
                )
            )
        );
    }
}

class Mutation extends BaseMutationResolvers<types.WorkType> {
    constructor(){
        super(__modelname);
    }

    @ResolverSaveCatch
    async create(
        _: any, 
        args: types.CreateArgs, 
        ctx: types.AppContext,
    ): Promise<types.APIResponse<types.WorkType>> {
        const { data } = args;

        data.img_url = data.img_url.href;

        return await super.create(_, args, ctx);
    }
}

const resolvers: types.Resolvers = {
    Query: new Query().register().resolvers ,
    Mutation: new Mutation().register().resolvers
};

export default resolvers;