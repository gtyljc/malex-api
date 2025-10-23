
import { GraphQLJSONObject } from "graphql-type-json";

function mutationErrorResponse(message, code){
    return {
        code,
        message,
        success: false,
        data: null
    }
}

function mutationSuccessResponse(data){
    return {
        code: 200,
        message: "Success",
        success: true,
        data
    }
}

// if the key action of mutation is mutation of DB
function mutationBasedOnDBResponse(result){ // result => db result

    // bad response from DB
    if (result instanceof Error){
        return mutationErrorResponse(result.message.replace(/[\n\r\t]+/g, ''), 500);
    }
    
    return mutationSuccessResponse(result);
}

// if the key action of mutation is mutation inside of external REST API
function mutationBasedOnRESTResponse(result){ // result => object (converted from JSON)

    // bad response from external REST API
    if (!result.success){
        return mutationErrorResponse(result.message, result.code);
    }

    return mutationSuccessResponse(result);
}

class ResolversManager {
    // !!! if you want to use resolvers in high-definied object use "resolvers" property !!!

    #resolvers = {};

    addResolver(name, func){
        this[name] = func; // to be polymorphismable
        this.#resolvers[name] = func;
    }

    get resolvers(){
        return this.#resolvers;
    }
}

class BaseQueryResolvers extends ResolversManager{   
    constructor(modelname) {
        super();

        // get single object
        this.addResolver(
            modelname,
            async (_, { id }, { dataSources }) => {
                return await dataSources.db.getOne(modelname, id);
            },
        )

        // get many objects
        this.addResolver(
            modelname + "s",
            async (_, { ids, filter, pagination }, { dataSources }) => {
                return await dataSources.db.getMany(modelname, ids, filter, pagination);
            }
        )
    }
}

class BaseMutationResolvers extends ResolversManager {
    // Methods params and their response
    // updateOne (id, )

    // names of resolvers
    #updateOneName;
    #updateManyName;
    #deleteOneName;
    #deleteManyName;
    #createName;

    constructor(modelname) {
        super();

        this._marker = modelname.charAt(0).toUpperCase() + modelname.slice(1); // how resolvers were marked

        // configurate names
        this.#updateOneName = `update${this._marker}`;
        this.#updateManyName = `updateMany${this._marker}s`;
        this.#deleteOneName = `delete${this._marker}`;
        this.#deleteManyName = `deleteMany${this._marker}s`;
        this.#createName = `create${this._marker}`

        // update one
        this.addResolver(
            this.#updateOneName, 
            async (_, {id, data}, { dataSources }) => {
                return mutationBasedOnDBResponse(
                    await dataSources.db.updateOne(modelname, id, data)
                );
            }
        )

        // update many
        this.addResolver(
            this.#updateManyName,
            async (_, { ids, data }, { dataSources }) => {
                return mutationBasedOnDBResponse(
                    await dataSources.db.updateMany(modelname, ids, data)
                );
            }
        )

        // delete one
        this.addResolver(
            this.#deleteOneName,
            async (_, { id }, { dataSources }) => {
                return mutationBasedOnDBResponse(
                    await dataSources.db.deleteOne(modelname, id)
                );
            }
        )

        // delete many
        this.addResolver(
            this.#deleteManyName,
            async (_, { ids }, { dataSources }) => {
                return mutationBasedOnDBResponse(
                    await dataSources.db.deleteMany(modelname, ids)
                );
            }
        )

        // create instance of model
        this.addResolver(
            this.#createName,
            async (_, { data }, { dataSources }) => {
                return mutationBasedOnDBResponse(
                    await dataSources.db.create(modelname, data)
                );
            }
        )
    }
}

class ImagesUploadSupportResolvers extends BaseMutationResolvers {
    #startUploadName;
    
    constructor(modelname) {
        super(modelname);

        this.#startUploadName = `upload${this._marker}Image`;

        this.addResolver(
            this.#startUploadName,
            async (_, { img_id }, { dataSources }) => {
                const r = await dataSources.imgCloudAPI.directUpload(img_id);

                if (r.success){
                    return mutationBasedOnDBResponse(
                        {
                            id: r.data.id,
                            url: r.data.uploadURL
                        }
                    )
                }
                
                return mutationBasedOnRESTResponse(r);
            }
        )
    }
}

export default {
    JSON: GraphQLJSONObject,
    Query: {
        ...new BaseQueryResolvers("work").resolvers,
        ...new BaseQueryResolvers("appointment").resolvers
    },
    Mutation: {
        ...new ImagesUploadSupportResolvers("work").resolvers,
        ...new BaseMutationResolvers("appointment").resolvers
    }
}