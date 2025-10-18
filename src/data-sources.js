
// db
import { PrismaClient } from '../prisma/generated/client.js';
import { withAccelerate } from "@prisma/extension-accelerate";

class PaginationError extends Error {
    name="PaginationError"
    message="Each request on massive of objects must include pagination!"
}

export class DatabaseSource {
    // all methods expect id in String format

    RECONNECTION_DELAY = 1; // seconds

    constructor (){
        this.isConnectionEstablished;
        this.prisma = new PrismaClient().$extends(withAccelerate());
    }

    // infinite loop, that will not stop until connection will be established
    async #establishConnection() {
        while (true) {
            try {
                this.prisma.$connect().then(
                    () => this.isConnectionEstablished = true
                ); // trying

                break
            }
            catch (error) {
                if (error.code == "P1001") {
                    console.log("Can't reach the database");

                    setTimeout(() => {}, this.RECONNECTION_DELAY);
                }
                else {
                    throw error;
                }
            }
        }
    }

    async #sendQuery(query, method, model){
        try {
            return await this.prisma[model][method](query);   
        }
        catch (error) {
            if (error.code == "P1001") {
                this.#establishConnection()
            }
            else {

                // safe error raising
                return error;
            }
        }
    }

    // you can get an array of objects that has specified at ids array id
    // or you can get a massive of objects that are suitable for specified filter,
    // in this case you should use pagination
    async #many(query, method, model, ids, filter, pagination){
   
        // get objects by specified ids
        if(ids) {
            return await this.#sendQuery(
                {
                    where: {id: { in: ids.map(e => parseInt(e))}}, 
                    ...query
                }, method, model
            );
        }

        // get objects by filter
        if(filter) {

            // if pagination param wasn't specified
            if (!pagination) {
                return new PaginationError();
            }

            // pagination params
            const skip = pagination.perPage * pagination.page;
            const take = pagination.perPage;

            let r = await this.#sendQuery(
                {
                    ...query,
                    ...filter,
                    skip,
                    take
                },
                method, 
                model
            )

            if (!(r instanceof Error)){
                const total = this.prisma[model].count()

                r = {
                    ...r, 
                    total, 
                    pageInfo: {
                        hasNextPage: total - (skip + take) > 0,
                        hasPreviousPage: skip - take > 0
                    }
                }
            }

            return r;
        }


        return [];
    }

    // if the target is interaction with only one object
    async #one(query, method, model, _id){
        return await this.#sendQuery(
            {
                ...query,
                where: {id: parseInt(_id)} 
            }, 
            method,
            model
        );
    }

    async getMany(model, ids, filter, pagination) {
        return await this.#many({}, "findMany", model, ids, filter, pagination)
    }

    async getOne(model, id) {
        return await this.#one({}, "findFirst", model, id)
    }

    async updateMany(model, ids, data) {
        return await this.#many({data: data}, "updateMany", model, ids)
    }

    async updateOne(model, id, data) {
        return await this.#one({data: data}, "update", model, id)
    }

    async deleteMany(model, ids) {
        return await this.#many({}, "deleteMany", model, ids)
    }

    async deleteOne(model, id) {
        return await this.#one({}, "delete", model, id)
    }

    async create(model, data) {
        return await this.prisma[model].create({data})
    }
}

export class CloudflareImagesStorageAPI {
    RETURN_TEMPLATE = {
        data: null, // list or single object (can be null)
        success: null, // boolean
        code: null, // HTTP Response code
        message: null // Error message or just "success" in case of 200 code
    };
    #token;
    #account_id;

    constructor(token, account_id){
        this.#token = token;
        this.#account_id = account_id;
        this.CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/accounts/${this.#account_id}/images/v1` // without endpoints
    }

    async #send(endpoint, method, body=null){
        const r = await (
            await fetch(
                this.CLOUDFLARE_API_URL + `/${endpoint}`,
                {
                    method, 
                    headers: {"Authorization": `Bearer ${this.#token}`}, // via TOKEN
                    body
                }
            )
        ).json(); // already converted to js object


        if (r.success){
            this.RETURN_TEMPLATE["code"] = 200;
            this.RETURN_TEMPLATE["message"] = "Success";
            this.RETURN_TEMPLATE["success"] = true;
            this.RETURN_TEMPLATE["data"] = r.result;
        }
        else {
            const er = r.errors[0];

            this.RETURN_TEMPLATE["code"] = er["code"];
            this.RETURN_TEMPLATE["message"] = er["message"];
            this.RETURN_TEMPLATE["success"] = false;
            this.RETURN_TEMPLATE["data"] = null;
        }

        return this.RETURN_TEMPLATE;
    }

    async uploadImage(img) { // file instance
        const body = new FormData();

        // setup and insert image into request    
        body.append("file", img);

        return await this.#send("POST", body)
    }

    async deleteImage(img_id) {
        return await this.#send(img_id, "DELETE")
    }

    async imageInfo(img_id) {
        return await this.#send(img_id, "GET")
    }
}