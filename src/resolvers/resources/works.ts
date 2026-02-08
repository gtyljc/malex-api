
// resolvers for model "Work"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource-base";
import * as responses from "@src/responses";
import * as types from "@src/types";
import * as errors from "@src/errors";
import * as tools from "@src/tools";

const __modelname = "work";

class WorkQueryResolvers extends BaseQueryResolvers {
    newWorks() {   
        async function inner(
            _: any, 
            { num }: types.QueryNewWorksArgs, 
            { dataSources: { db } }: types.AppContext
        ) {

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

        return inner;
    }

    getWorks() {
        const p_func = super.getMany();

        async function inner(
            _: any,
            args: types.GetManyArgs, 
            ctx: types.AppContext
        ): Promise<types.APIResponse> {
            const r = await p_func(_, { ...args, ids: [] }, ctx);

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

        return inner;
    }
}

const resolvers: types.Resolvers = {
    Query: { ...new WorkQueryResolvers(__modelname).register().resolvers },
    Mutation: { ...new BaseMutationResolvers(__modelname).register().resolvers }
};

export default resolvers;