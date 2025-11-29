
// others
import { sleep } from "./tools.ts";
import * as types from "./types/index.ts";

// db
import { PrismaClient } from "@prisma/client";
import { Prisma } from '../prisma/generated/client.js';

export function formatSResponse(
    data: any[]
): types.ResponseSchema {    
    return {
        code: 200,
        message: "Success",
        success: true,
        data,
    };
}

export function formatFResponse(
    code: number, 
    message: string = "Query failed! See more at logs."
): types.ResponseSchema {
    return {
        code,
        message,
        success: false,
        data: [],
    };
}

export class DatabaseConnectionStatus {
    isTryingToConnect = false;
    prismaClient: PrismaClient;

    constructor(prisma: PrismaClient){
        this.prismaClient = prisma;
    }

    // infinite loop, that will not stop until connection will be established
    async establishConnection(): Promise<void> {

        // block parallel two or more working methods
        if (this.isTryingToConnect) return;

        this.isTryingToConnect = true;

        while (this.isTryingToConnect) {
            try {
                await this.prismaClient.$connect(); // trying to connect
                
                console.log("Connection established!");

                this.isTryingToConnect = false;

                break
            }
            catch (error) {
                if (error instanceof Prisma.PrismaClientInitializationError) {
                    console.log("Can't reach the database! Trying to reconnect...");

                    // delay
                    await sleep(parseInt(process.env.DATABASE_RECONNECTION_DELAY));
                }
                else {
                    throw error;
                }
            }
        }
    }
}

export class DatabaseSource {
    // all methods expect id in string

    connection: DatabaseConnectionStatus;
    prismaClient: PrismaClient;
    private errorCases: Function[];

    constructor (prisma_client: PrismaClient, connection: DatabaseConnectionStatus){
        this.prismaClient = prisma_client;
        this.connection = connection;
        this.errorCases = [

            // in case of lost connection to DB (on start)
            async (error: Error) => {
                error instanceof Prisma.PrismaClientInitializationError &&
                await this.connection.establishConnection()
            },

            // in case of lost connection to DB (during requesting)
            async (error: Error) => {
                (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P1001") &&
                await this.connection.establishConnection()
            }
        ];
    }

    // silent error cathing + returns ready to send response
    private async sendQuery(
        modelname: types.Resource, 
        method: types.DBMethod, 
        query = {}
    ): Promise<types.ResponseSchema> {
        try {
            const data = await this.prismaClient[modelname][method](query);

            // format response; if the return type is single object => wrap it into array
            return formatSResponse(data instanceof Array ? data: [ data ]);
        }
        catch (error) {
            console.log(error);

            // going through cases
            for (let func of this.errorCases){
                await func(error);
            }

            return formatFResponse(400, "Query failed! See more at logs");
        }
    }

    // decider which method should be use: manyByIds or manyByFilter
    private async getManyEntities(
        modelname: types.Resource, 
        method: types.DBMethod,
        {
            ids,
            filter,
            pagination
        }: {
            ids?: string[],
            filter?: Object,
            pagination?: types.PaginationInput
        },
        query = {}
    ): Promise<types.ResponseSchema> {

        // get objects by specified ids
        if(ids !== undefined) {
            return await this.sendQuery(
                modelname,
                method,
                {
                    where: {id: { in: ids.map(e => parseInt(e))}}, 
                    ...query
                }
            );
        }

        // get objects by filter
        if(filter !== undefined) {

            // pagination params
            const skip = pagination.perPage * (pagination.page - 1);
            const take = pagination.perPage;
            const data = await this.sendQuery(
                modelname,
                method,
                {
                    ...query,
                    ...filter,
                    skip,
                    take
                }
            );
            const total = (await this.sendQuery(modelname, "count")).data[0];

            return {
                
                // main part of response
                ...data,

                pagination: {
                    total,
                    pageInfo: {
                        hasNextPage: total - (skip + take) > 0,
                        hasPreviousPage: skip - take > 0
                    }
                }
            }
        } 
    }

    // if the target is interaction with only one object
    private async getOneEntity(
        modelname: types.Resource, 
        method: types.DBMethod, 
        id: string, 
        query = {}
    ): Promise<types.ResponseSchema> {
        return await this.sendQuery(
            modelname,
            method,
            { ...query, where: { id: parseInt(id) } }
        );
    }

    async getOne(modelname: types.Resource, id: string) {
        return await this.getOneEntity(modelname, "findFirst", id)
    }

    // can be used in two cases: spefied ids array, specified filter + pagination params
    async getMany(
        modelname: types.Resource,
        { 
            ids, 
            filter, 
            pagination,
            sort 
        }: {
            ids?: string[],
            filter?: Object,
            pagination?: types.PaginationInput,
            sort?: types.SortInput
        }
    ): Promise<types.ResponseSchema> {
        return await this.getManyEntities(
            modelname,
            "findMany",
            {
                ids,
                filter: (filter ? { where: filter }: filter),
                pagination
            },
            { ...(sort ? { orderBy: { [sort.field]: sort.order.toLowerCase() } }: {}) },
        )
    }

    async updateOne(modelname: types.Resource, id: string, data: Object) {
        return await this.getOneEntity(modelname, "update", id, { data });
    }

    async updateMany(modelname: types.Resource, ids: string[], data: Object) {
        return this.getManyEntities( modelname, "updateMany", { ids }, { data });
    }

    async deleteOne(modelname: types.Resource, id: string) {
        return await this.getOneEntity(modelname, "delete", id);
    }

    async deleteMany(modelname: types.Resource, ids: string[]) {
        return await this.getManyEntities(modelname, "deleteMany", { ids });
    }

    async create(modelname: types.Resource, data: Object) {
        return await this.sendQuery(modelname, "create", { data });
    }
}