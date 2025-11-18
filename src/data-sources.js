
// db
import { Prisma } from '../prisma/generated/client.js';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatMutationSuccessResponse(data){
    return {
        code: 200, 
        message: "Success",
        success: true,
        data
    }
}

export function formatMutationFailureResponse(code, data){
    return {
        code,
        message: "Query failure! Read more at logs.",
        success: false,
        data
    }
}

export class DatabaseConnectionStatus {
    // must be as an argument of each instance of class DatabaseSource

    #RECONNECTION_DELAY = 10000; // miliseconds
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
                    await sleep(this.#RECONNECTION_DELAY);
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

    // #MAX_QUERY_RECURSION_DEPTH = 5;
    #DEFAULT_PAGINATION = {
        perPage: 10,
        page: 1
    }
    #errorCases;

    constructor (prisma, connectionStatus){
        this.prisma = prisma;
        this.connectionStatus = connectionStatus;
        this.#errorCases = [

            // in case of lost connection to DB
            async (error) => {
                error instanceof Prisma.PrismaClientInitializationError &&
                await this.connectionStatus.establishConnection()
            },
        ];
    }

    // silent error cathing; returns array where first value is the result of query
    // (in case of error will return empty array or empty single object)
    // and the second value means that request to DB was successfull (true or false).
    async #sendQuery(model, method, query = {}){
        // if (recursionDepth != 0) {
        //     try {
        //         const data = await this.prisma[model][method](query);
                
        //         // format response
        //         return [ data, true ];
        //     }
        //     catch (error) {
        //         console.log(error);

        //         // going through cases
        //         for (let func of this.#errorCases){
        //             await func(error);
        //         }

        //         // return this.#sendQuery(model, method, query, recursionDepth - 1);
        //     }
        // }

        try {
            const data = await this.prisma[model][method](query);
            
            // format response
            return [ data, true ];
        }
        catch (error) {
            console.log(error);

            // going through cases
            for (let func of this.#errorCases){
                await func(error);
            }

            // return this.#sendQuery(model, method, query, recursionDepth - 1);
        }
        
        // // which type of method was used ("Many" or "One")
        // return method.includes("Many") ? [ [], false ]: [ {}, false ];

        return [];
    }

    // get an array of objects that has specified id at ids array
    async #manyByIds(model, method, query, ids){
        const [ data, status ] = await this.#sendQuery(
            model,
            method,
            {
                where: {id: { in: ids.map(e => parseInt(e))}}, 
                ...query
            }
        );

        return (
            status ? formatMutationSuccessResponse({ items: data }): 
            formatMutationFailureResponse(500, data)
        ) 
    }
    
    // get a massive of objects that are suitable for specified filter 
    // and then paginate the DB response; returns same answer as #sendQuery
    async #manyByFilter(model, method, query, filter, pagination){

        // pagination params
        const skip = pagination.perPage * (pagination.page - 1);
        const take = pagination.perPage;

        const [ rData, rStatus ] = await this.#sendQuery(
            model,
            method,
            {
                ...query,
                ...filter,
                skip,
                take
            }
        );
        const [ cData, cStatus ] = await this.#sendQuery(model, "count");
        const endData = {
            code: (cStatus & rStatus) ? 200: 500,
            success: cStatus & rStatus,
            message: (cStatus & rStatus) ? "Success": "Query failure! Read more at logs.",
            data: rData,
            pagination: {
                total: cData,
                pageInfo: {
                    hasNextPage: this.total - (skip + take) > 0,
                    hasPreviousPage: skip - take > 0
                }
            }
        }

        return endData;
    }

    // decider which method should be use: manyByIds or manyByFilter
    async #many(model, method, query, ids, filter, pagination){
        let r = [];

        // get objects by specified ids
        if(ids) {
            r = await this.#manyByIds(model, method, query, ids);
        }

        // get objects by filter
        if(filter) {
            r = await this.#manyByFilter(model, method, query, filter, pagination)
        }

        console.log(r);

        return r;
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

    async getMany(model, { ids = null, filter = null, pagination = null, sort = null }) {
        return await this.#many(
            model, 
            "findMany", 
            { ...(sort ? { orderBy: { [sort.field]: sort.order.toLowerCase() } }: {}) }, // add sort if necessary
            ids, 
            filter, 
            !pagination ? this.#DEFAULT_PAGINATION: pagination,
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
        const [ _data, status ] = await this.#sendQuery(model, "create", { data });

        return (
            status ? formatMutationSuccessResponse(_data): 
            formatMutationFailureResponse(500, _data)
        )
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
            r.success ? formatMutationSuccessResponse(r.result): 
            formatMutationFailureResponse(
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
        
        return await this.#send("POST", {endpoint: "direct_upload", body, version:2})
    }
}