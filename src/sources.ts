
// others
import * as utils from "@lib/utils";
import * as types from "./lib/types/index";
import * as responses from "@lib/responses";
import * as errors from "@lib/errors";
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "@lib/utils";
import logger from "@lib/logger";
import { nanoid } from "nanoid";
import Cloudflare from "cloudflare";
import { createClient } from "redis";

// db
import { PrismaClient } from "@src/lib/prisma/generated/client";
import { Prisma } from "@src/lib/prisma/generated";

type DBMethod = (
    "findUnique" |
    "findFirst" | 
    "findMany" | 
    "update" |
    "updateMany" | 
    "delete" | 
    "deleteMany" |
    "count" |
    "create"
);

class DatabaseConnection {
    isTryingToConnect = false;
    client: any;

    constructor(){
        const adapter = new PrismaPg({ connectionString: env("DATABASE_URL") });

        this.client = new PrismaClient({ adapter }).$extends(withAccelerate());
    }

    // infinite loop, that will not stop until DBConnection will be established
    async establishConnection(): Promise<void> {

        // block parallel two or more working methods
        if (this.isTryingToConnect) return;

        this.isTryingToConnect = true;

        while (this.isTryingToConnect) {
            try {
                await this.client.$connect(); // trying to connect

                logger.info("Connection to DB established!");

                this.isTryingToConnect = false;

                break
            }
            catch (error) {
                if (error instanceof Prisma.PrismaClientInitializationError) {
                    logger.warn("No connection to DB, reconnecting...");

                    new errors.DatabaseConnectionError();

                    // delay
                    await utils.sleep(env("DATABASE_RECONNECT_DELAY"));
                }
                else {
                    throw error;
                }
            }
        }
    }
}

class DBQuery<RequestResultType> {
    queryId: string;
    errorHandlers: Map<string, Function>;
    method: DBMethod;
    queryBody: Record<any, any>;
    modelname: types.ResourceEnum;
    success = false;
    qResult!: RequestResultType;
    errorInstance!: Error; // in case query has failed
    apiResponse!: types.APIResponse<any>;

    constructor(
        modelname: types.ResourceEnum,
        method: DBMethod,
        queryBody: Record<any, any> = {}
    ){
        this.queryId = nanoid(10);
        this.errorHandlers = new Map();

        this.errorHandlers.set(
            Prisma.PrismaClientInitializationError.name, 
            async (error: Error) => { 
                error instanceof Prisma.PrismaClientInitializationError &&
                error.errorCode == "P1001" && await DBConnection.establishConnection() 
            }
        );

        this.errorHandlers.set(
            Prisma.PrismaClientKnownRequestError.name,
            async (error: Error) => {
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code == "P1001" && await DBConnection.establishConnection()
            }
        )
        
        this.method = method;
        this.queryBody = queryBody;
        this.modelname = modelname;
    }

    // wraps DB response and converts into API response
    private wrapQResult(): types.APIResponse<any> {
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
            logger.debug(`Executing query with method ${ this.method } on model ${ this.modelname }`)

            const r = await DBConnection.client[this.modelname][this.method](this.queryBody);

            // set result to instance
            this.qResult = r;
            this.success = true;
            this.apiResponse = this.wrapQResult();
        }
        catch (error: any) {
            this.success = false;
            this.errorInstance = error as Error;
            this.apiResponse = this.wrapQResult();

            // going through cases
            for (let [ key, value ] of this.errorHandlers.entries()){
                if (error.name == key){
                    let r = value();

                    if (r instanceof Promise){
                        r = await r;
                    }
                }
            }

            // when don't match cases
            throw new errors.DatabaseDriverError(error);
        }

        return this;
    }
}

export class DatabaseSource {
    // each request to API makes new instance of object
    
    dbConnection: DatabaseConnection;

    constructor(){
        this.dbConnection = DBConnection;
    }

    // returns request filter part on specified ids
    private filterByIds(ids: string[]): Object {
        return { id: { in: ids.map(e => parseInt(e)) } }
    }

    // returns request orderBy part
    private orderBy(
        field: types.SortInput["field"], 
        method: types.SortInput["order"]
    ): Object {
        return { orderBy: { [ field ]: method.toLowerCase() } }
    }

    async getOneById(modelname: types.ResourceEnum, id: string) {
        return await new DBQuery<any>(modelname, "findUnique", { where: { id: parseInt(id) } }).send();
    }

    async getOneByFilter(modelname: types.ResourceEnum, filter: Object) {
        return await new DBQuery<any>(modelname, "findFirst", { where: filter }).send();
    }

    async getManyByIds(modelname: types.ResourceEnum, ids: string[], sort?: types.SortInput) {
        return await new DBQuery<Array<any>>(
            modelname, 
            "findMany", 
            { 
                where: this.filterByIds(ids),
                ...(sort ? this.orderBy(sort.field, sort.order): {})
            }
        ).send();
    }

    async getManyByFilter(modelname: types.ResourceEnum, filter: Object, pagination?: types.PaginationInput, sort?: types.SortInput){

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

    async updateById(modelname: types.ResourceEnum, id: string, data: Object) {
        return await new DBQuery<any>(
            modelname, 
            "update", 
            { where: { id: parseInt(id) }, data }
        ).send();
    }

    async updateByFilter(modelname: types.ResourceEnum, filter: Object, data: Object) {
        return await new DBQuery<any>(
            modelname, 
            "update", 
            { where: filter, data }
        ).send();
    }

    async updateManyByIds(modelname: types.ResourceEnum, ids: string[], data: Object) {
        return await new DBQuery<Array<any>>(
            modelname, 
            "updateMany", 
            { where: this.filterByIds(ids), data }
        ).send();
    }

    async updateManyByFilter(modelname: types.ResourceEnum, filter: Object, data: Object) {
        return await new DBQuery<Array<any>>(
            modelname,
            "updateMany",
            { where: filter, data }
        ).send();
    }

    async deleteById(modelname: types.ResourceEnum, id: string) {
        return await new DBQuery<any>(
            modelname,
            "delete",
            { where: { id: parseInt(id) } }
        ).send();
    }

    async deleteByFilter(modelname: types.ResourceEnum, filter: Object) {
        return await new DBQuery<any>(
            modelname,
            "delete",
            { where: filter }
        ).send();
    }

    async deleteManyByIds(modelname: types.ResourceEnum, ids: string[]) {
        return await new DBQuery<Array<any>>(
            modelname,
            "deleteMany",
            { where: this.filterByIds(ids) }
        ).send();
    }

    async deleteManyByFilter(modelname: types.ResourceEnum, filter: Object) {
        return await new DBQuery<Array<any>>(
            modelname,
            "deleteMany",
            { where: filter }
        ).send();
    }

    async create(modelname: types.ResourceEnum, data: Object) {
        return await new DBQuery<any>(
            modelname,
            "create",
            { data }
        ).send();
    }

    async count(modelname: types.ResourceEnum) {
        return await new DBQuery<any>(modelname, "count").send()
    }
}

const DBConnection = new DatabaseConnection();
const DBSource = new DatabaseSource();
const CloudflareSource = new Cloudflare({ apiToken: env("CLOUDFLARE_API_TOKEN") });
const RedisSource = await createClient(
    { 
        url: env("REDIS_URL"), 
        socket: {
            reconnectStrategy: (retries, cause) => {
                logger.warn("No connection at redis client, reconnecting...");
                
                return env("REDIS_RECONNECT_DELAY");
            },
        }
    }
).on("error", (error: Error) => { logger.error(error.message) } ).connect();

export {
    DBSource,
    CloudflareSource,
    RedisSource,
    DBConnection
}