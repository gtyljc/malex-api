
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "@src/resource-base";
import * as types from "@lib/types";
import { dayjs } from "@lib/utils/dayjs";
import * as responses from "@src/responses";
import * as utils from "@lib/utils";
import { ResolverSaveCatch } from "@lib/utils";
import logger from "@lib/logger";

const __modelname = "appointment";

class Query extends BaseQueryResolvers {
    constructor(){
        super(__modelname)
    }

    @ResolverSaveCatch
    async busyInRange(
        _: any,
        { date, unit }: types.QueryBusyInRangeArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<types.BusyResponseType>>{
        function startOfDay(dayjs: dayjs.Dayjs): dayjs.Dayjs {
            return dayjs.hour(0).minute(0).second(0).millisecond(0)
        }

        function endOfDay(dayjs: dayjs.Dayjs): dayjs.Dayjs {
            return dayjs.hour(23).minute(59).second(59).millisecond(99)
        }

        logger.debug(`Get request for "busyInRange" Query field`)

        date = dayjs(date);

        if(unit == "DAY") {
            const dayOffset = dayjs().date();
            const monthTimeRange = [

                // first day of month
                dayjs().month() == date.month() ? startOfDay(date.date(dayOffset)): startOfDay(date.date(1)),
                
                // last day of month
                endOfDay(date.date(31))
            ];
            const siteConfig = await utils.getSiteConfig(db);
            const workTime = dayjs(siteConfig.closing_at).unix() - dayjs(siteConfig.opening_at).unix(); // seconds
            const apps = (
                await db.getManyByFilter(
                    __modelname,
                    { 
                        AND: [
                            { date: { gte: monthTimeRange[0].toISOString() } }, 
                            { date: { lte: monthTimeRange[1].toISOString() } } 
                        ]
                    }
                )
            ).qResult;
            let day = monthTimeRange[0];
            const busy: types.BusyType[] = [];

            while (day.unix() <= monthTimeRange[1].unix()){
                let dayTimeRange = [ startOfDay(day), endOfDay(day) ]
                let appsInDay = apps.filter( e => dayjs(e.date).isBetween(dayTimeRange[0], dayTimeRange[1]) );

                // if day is full of appointments
                if(appsInDay.reduce((acc, e) => acc + e.duration, 0) * 3600 == workTime){
                    busy.push({ busy: true, date: day.toISOString() });
                }

                // go to next day
                day = day.add(1, "day");
            }

            return responses.f200Response(busy);
        }

        if(unit == "APPOINTMENT") {
            const apps = (
                await db.getManyByFilter(
                    __modelname,
                    { 
                        AND: [
                            { date: { gte: startOfDay(date) } }, 
                            { date: { lte: endOfDay(date) } } 
                        ]
                    }
                )
            ).qResult;

            return responses.f200Response(apps.map( e => ({ date: e.date, busy: true })));
        }

        return responses.f400Response();
    }
}

class Mutation extends BaseMutationResolvers {
    constructor(){
        super(__modelname, { isDeletable: false })
    }
    
    @ResolverSaveCatch
    async create(
       _: any, 
       args: types.CreateArgs, 
       ctx: types.AppContext 
    ): Promise<types.APIResponse<types.AppointmentType>> {
        const { data } = args;

        // proof time range of appointment
        if (dayjs(data.date).unix() < dayjs().unix()) return responses.f400Response();

        // add default duration
        data["duration"] = (await utils.getSiteConfig(ctx.dataSources.db)).min_duration;

        return await super.create(_, args, ctx);
    }
}

const resolvers: types.Resolvers = {
    Query: new Query().register().resolvers,
    Mutation: new Mutation().register().resolvers
}

export default resolvers;