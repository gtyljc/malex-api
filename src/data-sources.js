
// db
import { Prisma } from '../prisma/generated/client.js';
import { sleep } from "./tools.js";

const RESPONSE_TEMPLATE = {
    code: "",
    message: "",
    success: null,
    data: null
};

export function formatSResponse(data){    
    const ins = Object.assign({}, RESPONSE_TEMPLATE);

    ins.data = data;
    ins.message = "Success";
    ins.success = true;
    ins.code = "200";

    return ins;
}

export function formatFResponse(code, msg){
    const ins = Object.assign({}, RESPONSE_TEMPLATE);

    ins.data = [];
    ins.message = msg;
    ins.success = false;
    ins.code = code;

    return ins;
}

export class DatabaseConnectionStatus {
    // must be as an argument of each instance of class DatabaseSource

    isTryingToConnect = false;

    constructor(prisma){
        this.prisma = prisma
    }

    // infinite loop, that will not stop until connection will be established
    async establishConnection() {

        // block parallel two or more working methods
        if (this.isTryingToConnect) return;

        this.isTryingToConnect = true;

        while (this.isTryingToConnect) {
            try {
                await this.prisma.$connect(); // trying to connect
                
                console.log("Connection established!");

                this.isTryingToConnect = false;

                break
            }
            catch (error) {
                if (error instanceof Prisma.PrismaClientInitializationError) {
                    console.log("Can't reach the database! Trying to reconnect...");

                    // delay
                    await sleep(process.env.DATABASE_RECONNECTION_DELAY);
                }
                else {

                    throw error;
                }
            }
        }
    }
}

export class DatabaseSource {
    // all methods expect ALL ids in String format;
    // every method of this class must use "#sendQuery" instead of 
    // direct interaction with DB

    #errorCases;

    constructor (prisma, connectionStatus){
        this.prisma = prisma;
        this.connectionStatus = connectionStatus;
        this.#errorCases = [

            // in case of lost connection to DB (on start)
            async (error) => {
                error instanceof Prisma.PrismaClientInitializationError &&
                await this.connectionStatus.establishConnection()
            },

            // in case of lost connection to DB (during requesting)
            async (error) => {
                (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P1001") &&
                await this.connectionStatus.establishConnection()
            }
        ];
    }

    // silent error cathing + returns ready to send response
    async #sendQuery(model, method, query = {}){
        try {
            const data = await this.prisma[model][method](query);

            // format response; if the return type is single object => wrap it into array
            return formatSResponse(data instanceof Array ? data: [ data ]);
        }
        catch (error) {
            console.log(error);

            // going through cases
            for (let func of this.#errorCases){
                await func(error);
            }

            return formatFResponse(500, "Query failed! See more at logs");
        }
    }

    // get an array of objects that has specified id at ids array
    async #manyByIds(model, method, query, ids){
        const data = await this.#sendQuery(
            model,
            method,
            {
                where: {id: { in: ids.map(e => parseInt(e))}}, 
                ...query
            }
        );

        return data;
    }
    
    // get a massive of objects that are suitable for specified filter 
    // and then paginate the DB response; returns same answer as #sendQuery
    async #manyByFilter(model, method, query, filter, pagination){

        // pagination params
        const skip = pagination.perPage * (pagination.page - 1);
        const take = pagination.perPage;

        const data = await this.#sendQuery(
            model,
            method,
            {
                ...query,
                ...filter,
                skip,
                take
            }
        );
        const count = await this.#sendQuery(model, "count");
        const returnData = {
            
            // main part of response
            ...data,

            pagination: {
                total: count.success ? count.data[0]: 1,
                pageInfo: {
                    hasNextPage: this.total - (skip + take) > 0,
                    hasPreviousPage: skip - take > 0
                }
            }
        }

        return returnData;
    }

    // decider which method should be use: manyByIds or manyByFilter
    async #many(model, method, query, ids, filter, pagination){

        // get objects by specified ids
        if(ids) {
            return await this.#manyByIds(model, method, query, ids);
        }

        // get objects by filter
        if(filter) {
            return await this.#manyByFilter(model, method, query, filter, pagination)
        } 
    }

    // if the target is interaction with only one object
    async #one(model, method, query, id){
        id =  parseInt(id);

        return await this.#sendQuery(
            model,
            method,
            { ...query, where: { id } }
        );
    }

    // can be used in two cases: spefied ids array, specified filter + pagination params
    async getMany(model, { ids = null, filter = null, pagination = null, sort = null }) {
        return await this.#many(
            model, 
            "findMany", 
            { ...(sort ? { orderBy: { [sort.field]: sort.order.toLowerCase() } }: {}) }, // add sort if necessary
            ids, 
            filter ? { where: filter }: filter, 
            pagination,
            sort
        )
    }

    async getOne(model, { id }) {
        return await this.#one(model, "findFirst", {}, id)
    }

    async updateMany(model, { ids, data }) {
        return this.#many( model, "updateMany", { data }, ids);
    }

    async updateOne(model, { id, data }) {
        return await this.#one(model, "update", { data }, id);
    }

    async deleteMany(model, { ids }) {
        return await this.#many(model, "deleteMany", {}, ids);
    }

    async deleteOne(model, { id }) {
        return await this.#one(model, "delete", {}, id);
    }

    async create(model, { data }) {
        return await this.#sendQuery(model, "create", { data });
    }
}

export class CloudflareImagesStorageAPI {
    #token;
    #account_id;
    #CLOUDFLARE_API_URL;

    constructor(token, account_id){
        this.#token = token;
        this.#account_id = account_id;
        this.#CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/accounts/${this.#account_id}/images` // without endpoints and API version
    }

    async #send(method, { body = null, endpoint = null, version=1} = {}){ // version => API version
        const r = await (
            await fetch(
                this.#CLOUDFLARE_API_URL + `/v${version}` + (endpoint ? `/${endpoint}`: ""),
                {
                    method, 
                    headers: {"Authorization": `Bearer ${this.#token}`}, // via TOKEN
                    body
                }
            )
        ).json(); // already converted to js object


        return (
            r.success ? formatSResponse(r.result): 
            formatFResponse(
                r.errors[0]["code"],
                r.errors[0]["message"],
                {}
            )
        )
    }

    async uploadImage(id, { creator = null, file = null, url = null, requireSignedURLs = false } = {}) { // file instance 
        const body = new FormData();

        // setup and insert image into request    
        file && body.append("file", file);
        id && body.append("id", id);   
        url && body.append("url", url);
        creator && body.append("creator", creator);
        body.append("requireSignedURLs", requireSignedURLs);

        return await this.#send("POST", body);
    }

    async deleteImage(id) {
        return await this.#send("DELETE", { endpoint: id })
    }

    async imageInfo(id) {
        return await this.#send("GET", { endpoint: id })
    }

    async directUpload(id, { creator = null, expiry = null, requireSignedURLs = false } = {}) { // expiry => ISO-8601 string
        const body = new FormData();

        id && body.append("id", id);
        expiry && body.append("url", expiry);
        creator && body.append("creator", creator);
        body.append("requireSignedURLs", requireSignedURLs);
        
        return await this.#send("POST", { endpoint: "direct_upload", body, version: 2 })
    }
}