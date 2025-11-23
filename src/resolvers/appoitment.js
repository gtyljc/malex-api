
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "./base.js";
import dayjs from "dayjs";

const __modelname = "appointment";

export default {
    Query: new BaseQueryResolvers(__modelname).resolvers,
    Mutation: {

        ...new BaseMutationResolvers(
            __modelname,
            { isDeletable: false }
        ).resolvers,

        // returns all appointments that are in the range of date
        async appointmentsInRange( _, { from, to }, { dataSources }){
            return await dataSources.db.getMany(
                __modelname, 
                { 
                    filter: { AND: [ { date: { gte: from } }, { date: { lte: to } } ] }, 
                    pagination: { perPage: 100, page: 1 }
                }
            );
        },

        // check is there free time for a new appointment(s)
        async isDayBusy(_, { day }, { dataSources }){
            
            const adminConfig = await dataSources.db.getOne(__modelname, { id: 1 }).data[0];
            const startingAt = dayjs(adminConfig.starting_at);
            const closingAt = dayjs(adminConfig.closing_at);
            const workDuration = closingAt.diff(startingAt, "hours"); // in hours

            for (let appointment of data){
                appointment.
            }
        }
    }
}