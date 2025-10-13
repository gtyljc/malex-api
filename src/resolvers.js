
import { GraphQLJSONObject } from "graphql-type-json";

export const resolvers = {
    JSON: GraphQLJSONObject,
    Query: {
        async works(_, { ids, filter, pagination }, { dataSources }){
            await dataSources.db.getMany("work", ids, filter, pagination);
        },

        async work(_, { id }, { dataSources }) {
            return await dataSources.db.getOne("work", id);
        }
    },
    Mutation: {
        async updateWork(_, { id, data }, { dataSources }) {         
            return await dataSources.db.updateOne("work", id, data);
        },

        async updateWorks(_, { ids, data }, { dataSources }) {
            return await dataSources.db.updateMany("work", ids, data);
        }

    }
}