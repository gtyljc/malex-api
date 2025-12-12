
// resolvers for model "Appointment"

import { BaseMutationResolvers, BaseQueryResolvers } from "./base";
import * as types from "../types";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import { formatSResponse } from "../sources";

dayjs.extend(isBetween);

const __modelname = "appointment";

// returns array, which will contains busy times (appointments that reserved for this day)
async function _busyTimesAtDay(date: string, db: types.AppContext["dataSources"]["db"]) {
    const appsInRange = (
        await db.getMany(
            __modelname, 
            { 
                filter: { 
                    AND: [ 
                        { date: { gte: dayjs(date).hour(0) } }, 
                        { date: { lte: dayjs(date).hour(23) } } 
                    ] 
                }, 
                pagination: { perPage: 100, page: 1 }
            }
        )
    ).data;

    return formatSResponse(appsInRange.map(e => ({ busy: true, date: e.date })))
}

// returns boolean, which means is there free place for new appointments
async function _isDayBusy(date: string, db: types.AppContext["dataSources"]["db"]) {
    const dateDayJS = dayjs(date);
    const adminConfig = (await db.getOne("siteConfig", "1")).data[0];
    const workHours = dayjs(adminConfig.closing_at).diff(adminConfig.starting_at, "hours");
    const appsInRange = (
        await db.getMany(
            __modelname, 
            { 
                filter: { 
                    AND: [ 
                        { date: { gte: dateDayJS.hour(0).toISOString() } }, 
                        { date: { lte: dateDayJS.hour(23).toISOString() } } 
                    ] 
                }, 
                pagination: { perPage: 100, page: 1 }
            }
        )
    ).data;
    var sumHours = 0;

    for (let app of appsInRange) sumHours += app.duration;

    return formatSResponse([{ date, busy: sumHours < workHours }]);
}

// returns array, which will contains busy days
async function _busyDaysAtMonth(date: string, db: types.AppContext["dataSources"]["db"]){
    const dateMonth = dayjs(date);
    const siteConfig = (await db.getOne("siteConfig", "1")).data[0];
    const workHours = dayjs(siteConfig.closing_at).diff(siteConfig.starting_at, "hours");
    const appsInRange = (
        await db.getMany(
            __modelname, 
            { 
                filter: { 
                    AND: [ 
                        { date: { gte: dateMonth.date(1).toISOString() } }, 
                        { date: { lte: dateMonth.date(dateMonth.daysInMonth()).toISOString() } } 
                    ] 
                }, 
                pagination: { perPage: 1000, page: 1 }
            }
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
                ).reduce((acc, e) => acc + e.duration, initV) < workHours,
                date: dateMonth.date(i + 1).toISOString()
            }
        );
    }

    return formatSResponse(r);
}

const resolversSchema: types.ResolversSchema = {
    Query: {
        ...new BaseQueryResolvers(__modelname).resolvers,

        busyTimesAtDay: async (
            _, 
            { date }: { date: string }, 
            { dataSources: { db } }: types.AppContext
        ) => await _busyTimesAtDay(date, db),

        isDayBusy: async (
            _, 
            { date }: { date: string }, 
            { dataSources: { db } }: types.AppContext
        ) => await _isDayBusy(date, db),

        busyDaysAtMonth: async (
            _, 
            { date }: { date: string }, 
            { dataSources: { db } }: types.AppContext
        ) => _busyDaysAtMonth(date, db)
    },
    Mutation: {
        ...new BaseMutationResolvers(
            __modelname,
            { isDeletable: false }
        ).resolvers,
    }
}

export default resolversSchema;