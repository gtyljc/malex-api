
import { GraphQLJSONObject } from "graphql-type-json";

function mutationErrorResponse(field, data, code, message){
    return {
        code,
        message,
        success: false,
        [field]: data
    }
}

function mutationSuccessResponse(field, data){
    return {
        code: 200,
        message: "Success",
        success: true,
        [field]: data
    }
}

function mutationResponse(result, typename){ // result => db result

    // bad response
    if (result instanceof Error){
        return mutationErrorResponse(typename, result, result.message, 500);
    }
    
    return mutationSuccessResponse(typename, result);
}

class BaseQueryResolvers {
    constructor(modelname) {
        this[modelname] = async (_, { id }, { dataSources }) => {
            return await dataSources.db.getOne(modelname, id);
        }

        this[modelname + "s"] = async (_, { ids, filter, pagination }, { dataSources }) => {
            return await dataSources.db.getMany(modelname, ids, filter, pagination);
        }
    }
}

class BaseMutationResolvers {
    constructor(modelname) { 
        this.marker = modelname.charAt(0).toUpperCase() + modelname.slice(1);

        // update one
        this[`update${this.marker}`] = async (_, {id, data}, { dataSources }) => {
            return mutationResponse(
                await dataSources.db.updateOne(modelname, id, data),
                modelname
            );
        }

        // update many
        this[`updateMany${this.marker}s`] = async (_, { ids, data }, { dataSources }) => {
            return mutationResponse(
                await dataSources.db.updateMany(modelname, ids, data),
                modelname + "s"
            );
        }

        // delete one
        this[`delete${this.marker}`] = async (_, { id }, { dataSources }) => {
            return mutationResponse(
                await dataSources.db.deleteOne(modelname, id),
                modelname
            );
        }

        // delete many
        this[`deleteMany${this.marker}s`] = async (_, { ids }, { dataSources }) => {
            return mutationResponse(
                await dataSources.db.deleteMany(modelname, ids),
                modelname + "s"
            );
        }

        // create instance of model
        this[`create${this.marker}`]  = async (_, { data }, { dataSources }) => {
            return mutationResponse(
                await dataSources.db.deleteMany(modelname, data),
                modelname + "s"
            );
        }
    }
}

class WorksMutationResolvers extends BaseMutationResolvers {
    constructor() {

        // init parent
        super("work");

        this[`update${this.marker}`] = async (...args) => {
            const contextValue = args[2];

            await contextValue.imgCloudAPI.upload()

            return await super[`update${this.marker}`](...args);
        }
    }
}

export default {
    JSON: GraphQLJSONObject,
    Query: {
        ...new WorksMutationResolvers("work"),
        ...new BaseQueryResolvers("appointment")
    },
    Mutation: {
        ...new WorksMutationResolvers("work"),
        ...new BaseMutationResolvers("appointment")
    }
}