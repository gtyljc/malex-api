
// others
import { sleep } from "./tools";
import * as types from "./types/index";
import * as responses from "./responses";
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from "@prisma/extension-accelerate";

// db
import { PrismaClient } from "@src/lib/prisma/generated/client";
import { Prisma } from "@src/lib/prisma/generated";

export class DatabaseConnection {
    isTryingToConnect = false;
    client: any;

    constructor(){
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

        this.client = new PrismaClient({ adapter }).$extends(withAccelerate());
    }

    // infinite loop, that will not stop until connection will be established
    async establishConnection(): Promise<void> {

        // block parallel two or more working methods
        if (this.isTryingToConnect) return;

        this.isTryingToConnect = true;

        while (this.isTryingToConnect) {
            try {
                await this.client.$connect(); // trying to connect
                
                console.log("Connection to DB established!");

                this.isTryingToConnect = false;

                break
            }
            catch (error) {
                if (error instanceof Prisma.PrismaClientInitializationError) {
                    console.log("Can't reach the DB! Trying to reconnect...");

                    // delay
                    await sleep(parseInt(process.env.DATABASE_RECONNECTION_DELAY!));
                }
                else {
                    throw error;
                }
            }
        }
    }
}

export const connection = new DatabaseConnection();

class DBQuery<RequestResultType> {
    errorCases: Array<(error: Error) => Promise<void>>;
    method: types.DBMethod;
    queryBody: Object;
    modelname: types.Resource;
    success = false;
    qResult!: RequestResultType;
    errorInstance!: Error; // in case query has failed
    apiResponse!: types.APIResponse<any>;

    constructor(
        modelname: types.Resource,
        method: types.DBMethod,
        queryBody: Object = {}
    ){
        this.errorCases = [

            // in case of lost connection to DB (on start)
            async (error: Error) => {
                error instanceof Prisma.PrismaClientInitializationError &&
                await connection.establishConnection()
            },

            // in case of lost connection to DB (during requesting)
            async (error: Error) => {
                (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P1001") &&
                await connection.establishConnection()
            }
        ];
        this.method = method;
        this.queryBody = queryBody;
        this.modelname = modelname;
    }

    // wraps DB response and converts into API response
    private wrap(): types.APIResponse<any> {
        if(this.success){

            // each result must be wrapped in array
            return responses.f200Response(
                this.qResult instanceof Array ? this.qResult: [ this.qResult ]
            );
        }
        else {
            return responses.f500Response();
        }
    }

    async send(): Promise<this> {
        try {
            const r = await connection.client[this.modelname][this.method](this.queryBody);

            // set result to instance
            this.qResult = r;
            this.success = true;
        }
        catch (error) {
            console.error(error);

            this.success = false;
            this.errorInstance = error as Error;

            // going through cases
            for (let func of this.errorCases){
                await func(error as Error);
            }
        }

        this.apiResponse = this.wrap();

        return this;
    }
}

export class DatabaseSource {
    // each request to API makes new instance of object
    
    dbConnection: DatabaseConnection;

    constructor(){
        this.dbConnection = connection;
    }

    // returns request filter part on specified ids
    private filterByIds(ids: string[]): Object {
        return { id: { in: ids } }
    }

    // returns request orderBy part
    private orderBy(
        field: types.SortInput["field"], 
        method: types.SortInput["order"]
    ): Object {
        return { orderBy: { [ field ]: method.toLowerCase() } }
    }

    async getOneById(modelname: types.Resource, id: string) {
        return await new DBQuery<any>(modelname, "findUnique", { where: { id } }).send();
    }

    async getOneByFilter(modelname: types.Resource, filter: Object) {
        return await new DBQuery<any>(modelname, "findFirst", { where: filter }).send();
    }

    async getManyByIds(modelname: types.Resource, ids: string[], sort?: types.SortInput) {
        return await new DBQuery<Array<any>>(
            modelname, 
            "findMany", 
            { 
                where: this.filterByIds(ids),
                ...(sort ? this.orderBy(sort.field, sort.order): {})
            }
        ).send();
    }

    async getManyByFilter(modelname: types.Resource, filter: Object, pagination?: types.PaginationInput, sort?: types.SortInput){

        // if pagination was specified
        const skip = pagination && pagination.perPage * (pagination.page - 1);
        const take = pagination && pagination.perPage;
        const endQ = await new DBQuery<Array<any>>(
            modelname,
            "findMany",
            {
                where: filter,
                ...(sort ? this.orderBy(sort.field, sort.order): {}),
                skip,
                take
            }
        ).send();

        if (endQ.success && pagination){
            const countQ = await this.count(modelname);
            const total = countQ.qResult;

            if (!countQ.success) countQ;

            endQ.apiResponse.pagination = {
                total: countQ.qResult,
                pageInfo: {
                    hasNextPage: total - (skip + take) > 0,
                    hasPreviousPage: skip! - take > 0
                }
            };
        }

        return endQ;
    }

    async updateById(modelname: types.Resource, id: string, data: Object) {
        return await new DBQuery<any>(
            modelname, 
            "update", 
            { where: { id }, data }
        ).send();
    }

    async updateByFilter(modelname: types.Resource, filter: Object, data: Object) {
        return await new DBQuery<any>(
            modelname, 
            "update", 
            { where: filter, data }
        ).send();
    }

    async updateManyByIds(modelname: types.Resource, ids: string[], data: Object) {
        return await new DBQuery<Array<any>>(
            modelname, 
            "updateMany", 
            { where: this.filterByIds(ids), data }
        ).send();
    }

    async updateManyByFilter(modelname: types.Resource, filter: Object, data: Object) {
        return await new DBQuery<Array<any>>(
            modelname,
            "updateMany",
            { where: filter, data }
        ).send();
    }

    async deleteById(modelname: types.Resource, id: string) {
        return await new DBQuery<any>(
            modelname,
            "delete",
            { where: { id } }
        ).send();
    }

    async deleteByFilter(modelname: types.Resource, filter: Object) {
        return await new DBQuery<any>(
            modelname,
            "delete",
            { where: filter }
        ).send();
    }

    async deleteManyByIds(modelname: types.Resource, ids: string[]) {
        return await new DBQuery<Array<any>>(
            modelname,
            "deleteMany",
            { where: this.filterByIds(ids) }
        ).send();
    }

    async deleteManyByFilter(modelname: types.Resource, filter: Object) {
        return await new DBQuery<Array<any>>(
            modelname,
            "deleteMany",
            { where: filter }
        ).send();
    }

    async create(modelname: types.Resource, data: Object) {
        return await new DBQuery<any>(
            modelname,
            "create",
            { data }
        ).send();
    }

    async count(modelname: types.Resource) {
        return await new DBQuery<any>(modelname, "count").send()
    }
}