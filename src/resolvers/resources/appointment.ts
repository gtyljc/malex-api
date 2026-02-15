
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource-base";
import * as types from "@src/types";
import { dayjs } from "@src/lib/dayjs";
import * as responses from "@src/responses";
import * as tools from "@src/tools";

const __modelname = "appointment";

class AppointmentQueryResolvers extends BaseQueryResolvers {
    constructor(){
        super(__modelname)
    }

    async busyInRange(
        _: any,
        { start, end, unit }: types.QueryBusyInRangeArgs, 
        { dataSources: { db } }: types.AppContext
    ){
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
            const siteConfig = await tools.getSiteConfig(db);
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
            return responses.f200Response(apps.map( e => ({ date: e.date, busy: true })));
        }
    }
}

class AppointmentMutationResolvers extends BaseMutationResolvers {
    constructor(){
        super(__modelname, { isDeletable: false })
    }
    
    async create(
       _: any, 
       args: types.CreateArgs, 
       ctx: types.AppContext 
    ): Promise<types.APIResponse> {
        const { data } = args;

        // proof time range of appointment
        if (dayjs(data.date).unix() < dayjs().unix()) return responses.f400Response();

        // add default duration
        data["duration"] = (await tools.getSiteConfig(ctx.dataSources.db)).min_duration;

        return await super.create(_, args, ctx);
    }
}

const resolvers: types.Resolvers = {
    Query: new AppointmentQueryResolvers().register().resolvers,
    Mutation: new AppointmentMutationResolvers().register().resolvers
}

export default resolvers;