
// db
import { PrismaClient } from '../prisma/generated/client.js';
import { withAccelerate } from "@prisma/extension-accelerate";


class DatabaseSource {
    // all methods expect id in String format

    prisma = new PrismaClient().$extends(withAccelerate());

    async #sendQuery(query, method, model){
        console.log(query);

        try {
            return await this.prisma[model][method](query);   
        }
        catch (error) {
            return error;
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
                    ...query, 
                    where: {id: { in: ids.map(e => parseInt(e)) }}
                },
                method,
                model
            )     
        }

        // get objects by filter
        if(filter) {
            return await this.#sendQuery(
                {
                    ...query,
                    ...filter,
                    ...(pagination == null ? {}: pagination)
                }
            )
        }   
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
        return await this.#many(
            {},
            "findMany",
            model,
            ids, 
            filter, 
            pagination
        )
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

export default DatabaseSource;