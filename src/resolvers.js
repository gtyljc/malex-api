
import { 
    JSONObjectResolver, 
    DateTimeISOResolver,
    PhoneNumberResolver,
    URLResolver,
    PositiveIntResolver,
    PositiveFloatResolver
} from "graphql-scalars";

function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1)
}

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

class ResolversUnionsManager {
    // !!! if you want to use resolvers in high-definied object use "resolvers" property !!!

    #resolvers = {};
    #unions = {};

    constructor(modelname){
        this._marker = capitalize(modelname); // how resolvers will be marked
    }

    addResolver(name, func){
        this.#resolvers[name] = func;
    }

    addUnion(name, object){
        this.#unions[name] = object;
    }

    get resolvers(){
        return this.#resolvers;
    }

    get unions(){
        return this.#unions
    }
}

class BaseQueryResolvers extends ResolversUnionsManager {
    
    // name of types that could be (because they will used at 
    // union specified in constructor) returned at " get many" request
    #getManyName = "";
    #getManyPaginatedName = "";

    constructor(modelname) {
        super(modelname);

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
            async (_, { ids, filter, pagination, sort }, { dataSources }) => {
                return await dataSources.db.getMany(modelname, ids, filter, pagination);
            }
        )

        this.#getManyName = `${this._marker}ItemsType`;
        this.#getManyPaginatedName = `${this._marker}ItemsPaginatedType`;

        const getManyUnionResolver = (obj) => {

            // with pagination
            if (obj.data){
                return this.#getManyPaginatedName
            }

            // without pagination
            if (obj.items){
                return this.#getManyName
            }
        }

        this.addUnion(
            `${this._marker}ItemsUnion`,
            {
                __resolveType: getManyUnionResolver
            }
        )
    }
}

class BaseMutationResolvers extends ResolversUnionsManager {
    // Methods params and their response
    // updateOne (id, )

    // names of resolvers
    #updateOneName;
    #updateManyName;
    #deleteOneName;
    #deleteManyName;
    #createName;

    constructor(modelname) {
        super(modelname);

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
    constructor(modelname) {
        super(modelname);

        this.addResolver(
           "startUploadImage",
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

        this.addResolver(
            "finalizeUploadImage",
            async (_, { img_id }, { dataSources }) => {
                const r = await dataSources.imgCloudAPI.imageInfo(img_id);

                if (r.success){
                    return mutationBasedOnDBResponse(
                        {
                            id: r.data.id,
                            urls: r.data.variants
                        }
                    )
                }
                
                return mutationBasedOnRESTResponse(r);
            }
        )
    }
}

// modelnames config
const WORK_MODELNAME = "work";
const APPOINTMENT_MODELNAME = "appointment";

const workQuery = new BaseQueryResolvers(WORK_MODELNAME);
const appointmentQuery = new BaseQueryResolvers(APPOINTMENT_MODELNAME);
const workMutation = new ImagesUploadSupportResolvers(WORK_MODELNAME);
const appointmentMutation = new BaseMutationResolvers(APPOINTMENT_MODELNAME);

export default {

    // scalars
    JSONObject: JSONObjectResolver,
    URL: URLResolver,
    PhoneNumber: PhoneNumberResolver,
    DateTimeISO: DateTimeISOResolver,
    PositiveInt: PositiveIntResolver,
    PositiveFloat: PositiveFloatResolver,

    // unions
    ...workQuery.unions,
    ...appointmentQuery.unions,

    // get requests
    Query: {
        ...workQuery.resolvers,
        ...appointmentQuery.resolvers
    },

    // update requests
    Mutation: {
        ...workMutation.resolvers,
        ...appointmentMutation.resolvers
    }
}