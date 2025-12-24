
// others
import { sleep } from "./tools";
import * as types from "./types/index";
import * as responses from "./responses";

// db
import { PrismaClient } from "@prisma/client";
import { Prisma } from '../prisma/generated';

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
    connection: DatabaseConnectionStatus;
    prismaClient: PrismaClient;
    private errorCases: Function[];
    static defaultPagination = { page: 1, perPage: 100 };

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
    async _sendQuery(modelname: types.Resource, method: types.DBMethod, query = {}): Promise<types.ResponseSchema> {
        try {
            const data = await this.prismaClient[modelname][method](query);

            // format response; if the return type is single object => wrap it into array
            return responses.f200Response(data instanceof Array ? data: [ data ]);
        }
        catch (error) {
            console.log(error);

            // going through cases
            for (let func of this.errorCases){
                await func(error);
            }

            return responses.f500Response();
        }
    }

    // returns request filter part on specified ids
    private whereByIds(ids: string[]): Object {
        return { id: { in: ids } }
    }

    // returns request orderBy part
    private orderBy(field:  types.SortInput["field"], method: types.SortInput["order"]): Object {
        return { orderBy: { [ field ]: method.toLowerCase() } }
    }

    async getOneById(modelname: types.Resource, id: string) {
        return await this._sendQuery(
            modelname,
            "findUnique",
            { where: { id } }
        )
    }

    async getOneByFilter(modelname: types.Resource, filter: Object) {
        return await this._sendQuery(modelname, "findFirst", { where: filter })
    }

    async getManyByIds(modelname: types.Resource, ids: string[], sort?: types.SortInput): Promise<types.ResponseSchema> {
        return await this._sendQuery(
            modelname,
            "findMany",
            { 
                where: this.whereByIds(ids),
                ...(sort ? this.orderBy(sort.field, sort.order): {})
            }
        )
    }

    async getManyByFilter(modelname: types.Resource, filter: Object, pagination?: types.PaginationInput, sort?: types.SortInput){
        const total = (await this._sendQuery(modelname, "count")).data[0];
        const skip = pagination && pagination.perPage * (pagination.page - 1);
        const take = pagination && pagination.perPage;

        return {
            ...(await this._sendQuery(
                    modelname,
                    "findMany",
                    { 
                        where: filter,
                        ...(sort ? this.orderBy(sort.field, sort.order): {}),
                        skip,
                        take
                    }
                )
            ),
            pagination: {
                total,
                pageInfo: {
                    hasNextPage: total - (skip + take) > 0,
                    hasPreviousPage: skip - take > 0
                }
            }
        }
    }

    async updateById(modelname: types.Resource, id: string, data: Object) {
        return await this._sendQuery(
            modelname,
            "update",
            { where: { id }, data }
        )
    }

    async updateByFilter(modelname: types.Resource, filter: Object, data: Object) {
        return await this._sendQuery(modelname, "update", { where: filter, data })
    }

    async updateManyByIds(modelname: types.Resource, ids: string[], data: Object) {
        return await this._sendQuery(
            modelname,
            "updateMany",
            { where: this.whereByIds(ids), data }
        )
    }

    async updateManyByFilter(modelname: types.Resource, filter: Object, data: Object) {
        return await this._sendQuery(
            modelname,
            "updateMany",
            { where: filter, data }
        )
    }

    async deleteById(modelname: types.Resource, id: string) {
        const record = (await this.getOneById(modelname, id));

        // remove record
        await this._sendQuery(modelname, "delete", { where: { id } });

        return responses.f200Response(record.data);
    }

    async deleteByFilter(modelname: types.Resource, filter: Object) {
        const record = (await this.getOneByFilter(modelname, filter));
        
        // remove record
        await this._sendQuery(modelname, "delete", { where: filter })

        return responses.f200Response(record.data);
    }

    async deleteManyByIds(modelname: types.Resource, ids: string[]) {
        const records = await this.getManyByIds(modelname, ids);
     
        // remove record
        await this._sendQuery(modelname, "deleteMany", { where: this.whereByIds(ids) });

        return responses.f200Response(records.data);
    }

    async deleteManyByFilter(modelname: types.Resource, filter: Object) {
        const records = await this.getManyByFilter(modelname, filter);
     
        // remove records
        await this._sendQuery(modelname, "deleteMany", { where: filter });

        return await this._sendQuery(modelname, "deleteMany", { where: filter })
    }

    async create(modelname: types.Resource, data: Object) {
        return await this._sendQuery(modelname, "create", { data });
    }
}