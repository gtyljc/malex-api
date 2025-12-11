
// resolvers for model "Work"

import { BaseMutationResolvers, BaseQueryResolvers } from "./base";
import { formatFResponse } from "../sources";
import * as types from "../types";
import * as errors from "../errors";
import * as tools from "../tools";

const __modelname = "work";

async function _newWorks(num: number, db: types.AppContext["dataSources"]["db"]){
    
    // pagination limitation
    if (num > parseInt(process.env.OBJECTS_PER_REQUEST_LIMIT)){
        return formatFResponse(400, tools.assembleErrorMessage(errors.PaginationLimitationError));
    }
    
    const works = (
        await db.getMany(
            __modelname, 
            { filter: {}, pagination: { page: 1, perPage: num } }
        )
    )

    works.data = works.data.map(
        e => (
            { 
                img_url: e.img_url, 
                category: e.category, 
                timestamp: e.timestamp 
            } 
        )
    );

    // add rest if response is not full with necessery num of works
    if (works.data.length < num){
        for (let i = 0; i < num - works.data.length; i++) works.data.push(null);
    }

    return works;
}

const resolversSchema: types.ResolversSchema = {
    Query: { 
        ...new BaseQueryResolvers(__modelname).resolvers,

        // returns standard resource "getMany" realisation, 
        // but only border visibility of special fields
        async getWorks (_, args: Object, context: types.AppContext){
            const r = await this.works(_, args, context);

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
        },

        newWorks: async (
            _, 
            { num }: { num: number }, 
            { dataSources: { db } }: types.AppContext
        ) => await _newWorks(num, db)
    },
    Mutation: { ...new BaseMutationResolvers(__modelname).resolvers }
};

export default resolversSchema;