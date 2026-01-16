
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource-base";
import * as types from "@src/types";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import * as responses from "@src/responses";

dayjs.extend(isBetween);

const __modelname = "appointment";

class AppointmentQueryResolvers extends BaseQueryResolvers {
    isDayBusy(){

        async function inner(
            _, 
            { date }: { date: string }, 
            { dataSources: { db } }: types.AppContext
        ) {
            const dateDayJS = dayjs(date);
            const adminConfig = (await db.getOneById("siteConfig", "1")).data[0];
            const workHours = dayjs(adminConfig.closing_at).diff(adminConfig.starting_at, "hours");
            const appsInRange = (
                await db.getManyByFilter(
                    __modelname, 
                    { 
                        AND: [ 
                            { date: { gte: dateDayJS.hour(0).toISOString() } }, 
                            { date: { lte: dateDayJS.hour(23).toISOString() } } 
                        ] 
                    },
                    { perPage: 100, page: 1 }
                )
            ).data;
            var sumHours = 0;

            for (let app of appsInRange) sumHours += app.duration;

            return responses.f200Response([{ date, busy: sumHours < workHours }]);
        }

        return inner;
    }

    busyTimesAtDay(){

        async function inner(
            _, 
            { date }: { date: string }, 
            { dataSources: { db } }: types.AppContext
        ) {
            const appsInRange = (
                await db.getManyByFilter(
                    __modelname,
                    { 
                        AND: [ 
                            { date: { gte: dayjs(date).hour(0) } }, 
                            { date: { lte: dayjs(date).hour(23) } } 
                        ] 
                    }, 
                    { perPage: 100, page: 1 }
                )
            ).data;

            return responses.f200Response(appsInRange.map(e => ({ busy: true, date: e.date })))
        }

        return inner;
    }

    busyDaysAtMonth(){

        async function inner(
            _, 
            { date }: { date: string }, 
            { dataSources: { db } }: types.AppContext
        ) {
            const dateMonth = dayjs(date);
            const siteConfig = (await db.getOneById("siteConfig", "1")).data[0];
            const workHours = dayjs(siteConfig.closing_at).hour() - dayjs(siteConfig.opening_at).hour();
            const appsInRange = (
                await db.getManyByFilter(
                    __modelname, 
                    { 
                        AND: [ 
                            { date: { gte: dateMonth.date(1).toISOString() } }, 
                            { date: { lte: dateMonth.date(dateMonth.daysInMonth()).toISOString() } } 
                        ] 
                    }, 
                    { perPage: 1000, page: 1 }
                    
                )
            ).data;

            const r = [];
            const initV = 0;

            for (let i = 0; i < dateMonth.daysInMonth(); i++){
                r.push(
                    { 
                        busy: appsInRange.filter(
                            e => dayjs(e.date).isBetween(
                                dateMonth.date(i + 1).hour(0), 
                                dateMonth.date(i + 1).hour(23)
                            )
                        ).reduce((acc, e) => acc + e.duration, initV) >= workHours, date: dateMonth.date(i + 1).toISOString()
                    }
                );
            }

            return responses.f200Response(r);
        }

        return inner;
    }
}

class AppointmentMutationResolvers extends BaseMutationResolvers {
    create() {
        const p_func = super.create();
    
        async function inner(_, args: any, ctx: types.AppContext) {
            const { data } = args;
            const { dataSources: { db } } = ctx;

            // proof time range of appointment
            if (dayjs(data.date).unix() < dayjs().unix()) return responses.f400Response();

            // add default duration
            data.duration = (await db.getOneById("siteConfig", "1")).data[0].min_duration;

            return await p_func(_, args, ctx);
        }

        return inner;
    }
}

const resolversSchema: types.ResolversSchema = {
    Query: { 
        ...new AppointmentQueryResolvers(
            __modelname
        ).register().resolvers
    },
    Mutation: {
        ...new AppointmentMutationResolvers(
            __modelname,
            { isDeletable: false }
        ).register().resolvers,
    }
}

export default resolversSchema;