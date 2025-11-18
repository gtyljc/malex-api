
import { 
    JSONObjectResolver, 
    DateTimeISOResolver,
    PhoneNumberResolver,
    URLResolver,
    PositiveIntResolver,
    PositiveFloatResolver
} from "graphql-scalars";
import { formatMutationSuccessResponse } from "./data-sources.js";

function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1)
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
    constructor(modelname) {
        super(modelname);

        // get single object
        this.addResolver(
            modelname,
            async (_, { id }, { dataSources }) => await dataSources.db.getOne(modelname, { id })
        )

        // get many objects
        this.addResolver(
            modelname + "s",
            async (_, { ids, filter, pagination, sort }, { dataSources }) => { 
                return await dataSources.db.getMany(modelname, { ids, filter, pagination, sort });
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
            async (_, { id, data }, { dataSources }) => await dataSources.db.updateOne(modelname, { id, data })
        )

        // update many
        this.addResolver(
            this.#updateManyName,
            async (_, { ids, data }, { dataSources }) => await dataSources.db.updateMany(modelname, { ids, data })
        )

        // delete one
        this.addResolver(
            this.#deleteOneName,
            async (_, { id }, { dataSources }) => await dataSources.db.deleteOne(modelname, { id })
        )

        // delete many
        this.addResolver(
            this.#deleteManyName,
            async (_, { ids }, { dataSources }) => await dataSources.db.deleteMany(modelname, { ids })
        )

        // create instance of model
        this.addResolver(
            this.#createName,
            async (_, { data }, { dataSources }) => await dataSources.db.create(modelname, { data })
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
                    return formatMutationSuccessResponse(
                        {
                            id: r.data.id,
                            url: r.data.uploadURL
                        }
                    )
                }
                
                return r;
            }
        )

        this.addResolver(
            "finalizeUploadImage",
            async (_, { img_id }, { dataSources }) => {
                const r = await dataSources.imgCloudAPI.imageInfo(img_id);

                if (r.success){
                    return formatMutationSuccessResponse(
                        {
                            id: r.data.id,
                            urls: r.data.variants
                        }
                    )
                }
                
                return r;
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