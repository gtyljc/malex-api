
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource-base";
import * as types from "@src/types";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import * as responses from "@src/responses";
import { getConfig } from "./site-config";

dayjs.extend(isBetween);

const __modelname = "appointment";

class AppointmentQueryResolvers extends BaseQueryResolvers {

    busyInRange(){

        async function inner(_, { start, end, unit }: types.QueryBusyInRangeArgs, { dataSources: { db } }: types.AppContext) {
            const apps = (
                await db.getManyByFilter(
                    __modelname,
                    { 
                        AND: [
                            { date: { gte: start } }, 
                            { date: { lte: end } } 
                        ]
                    }
                )
            ).qResult;

            if(unit == "DAY") {
                let day = dayjs(start);
                let busy: types.BusyType[] = [];
                const siteConfig = (await getConfig(db)).qResult;
                const workTime = dayjs(siteConfig.closing_at).diff(dayjs(siteConfig.starting_at));

                while (day.unix() < dayjs(end).unix()) {
                     let appsInDay = apps.filter(
                        e => dayjs(e.date).isBetween(
                            day.hour(0).minute(0).second(0).millisecond(0), 
                            day.hour(24).minute(0).second(0).millisecond(0)
                        )
                    );
                    day = day.add(1, "day");

                    busy = busy.concat(
                        appsInDay.map(
                            e => (
                                { 
                                    date: e.date, 
                                    busy: workTime <= appsInDay.reduce((acc, e) => acc += e.duration * 3600, 0) 
                                }
                            )
                        )
                    )
                }

                return responses.f200Response(busy);
            }

            if(unit == "APPOINTMENT") {
                return responses.f200Response(
                    apps.map( e => ({ date: e.date, busy: true }))
                );
            }
        }

        return inner;
    }
}

class AppointmentMutationResolvers extends BaseMutationResolvers {
    create() {
        const p_func = super.create();
    
        async function inner(_: any, args: types.CreateArgs, ctx: types.AppContext) {
            const { data } = args;
            const { dataSources: { db } } = ctx;

            // proof time range of appointment
            if (dayjs(data.date).unix() < dayjs().unix()) return responses.f400Response();

            // add default duration
            data["duration"] = (await getConfig(db)).qResult.min_duration;

            return await p_func(_, args, ctx);
        }

        return inner;
    }
}

const resolvers: types.Resolvers = {
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

export default resolvers;