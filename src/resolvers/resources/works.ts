
// resolvers for model "Work"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource-base";
import * as responses from "@src/responses";
import * as types from "@src/types";
import * as errors from "@src/errors";
import * as tools from "@src/tools";

const __modelname = "work";

class WorkQueryResolvers extends BaseQueryResolvers {
    constructor(){
        super(__modelname);
    }

    async newWorks(
        _: any, 
        { num }: types.QueryNewWorksArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse> {   

        // pagination limitation
        if (num > parseInt(process.env.OBJECTS_PER_REQUEST_LIMIT!)){
            return responses.f400Response(tools.assembleErrorMessage(errors.PaginationLimitationError));
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

    async getWorks(
        _: any,
        args: types.GetManyArgs, 
        ctx: types.AppContext
    ): Promise<types.APIResponse> {
        const r = await super.getMany(_, { ...args, ids: [] }, ctx);

        r.data = r.data.map(
            e => (
                {
                    img_url: e.img_url,
                    category: e.category,
                    timestamp: e.timestamp
                }
            )
        )

        return r;
    }
}

const resolvers: types.Resolvers = {
    Query: new WorkQueryResolvers().register().resolvers ,
    Mutation: new BaseMutationResolvers(__modelname).register().resolvers
};

export default resolvers;