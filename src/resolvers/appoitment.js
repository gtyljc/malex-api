
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "./base.js";

const __modelname = "appointment";

export default {
    Query: new BaseQueryResolvers(__modelname).resolvers,
    Mutation: {

        ...new BaseMutationResolvers(
            __modelname,
            { isUpdatable: false, isDeletable: false }
        ).resolvers,

        // returns all appointments that are in the range of date
        async getAppointmentsInRange( _, { from, to }, { dataSources }){
            return await dataSources.db.getMany(
                __modelname, 
                { 
                    filter: { AND: [ { date: { gte: from } }, { date: { lte: to } } ] }, 
                    pagination: { perPage: 100, page: 1 }
                }
            );
        }
    }
}