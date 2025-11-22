import { formatFResponse } from "../data-sources.js";
import { capitalize, assembleErrorMessage } from "../tools.js";
import { 
    IdsOrFilterWasNotSpecifiedError,
    PaginationIsNotSpecifiedError,
    PaginationLimitationError
} from "../errors.js";

class ResolversManager {
    // !!! if you want to use resolvers in high-definied object use "resolvers" property !!!

    #resolvers = {};

    constructor(modelname){
        this._resolverMarker = capitalize(modelname); // how resolvers will be marked
    }

    addResolver(name, func){
        this.#resolvers[name] = func;
    }

    get resolvers(){
        return this.#resolvers;
    }
}

export class BaseQueryResolvers extends ResolversManager {
    constructor(modelname, { isIterrable = true } = {}) {
        super(modelname);

        // get single object
        this.addResolver(
            modelname,
            async (_, { id }, { dataSources }) => await dataSources.db.getOne(modelname, { id })
        )

        // get many objects
        isIterrable && this.addResolver(
            modelname + "s",
            async (_, { ids, filter, pagination, sort }, { dataSources }) => {

                // if ids or filter wasn't specified
                if (ids == undefined & filter == undefined){
                    return formatFResponse(400, assembleErrorMessage(IdsOrFilterWasNotSpecifiedError));
                }

                // if filter was specified, but without pagination
                if (filter && pagination == undefined){
                    return formatFResponse(400, assembleErrorMessage(PaginationIsNotSpecifiedError));
                }

                // pagination exceeds 
                if (pagination.perPage > process.env.OBJECTS_PER_REQUEST_LIMIT){
                    return formatFResponse(400, assembleErrorMessage(PaginationLimitationError));
                }

                return await dataSources.db.getMany(modelname, { ids, filter, pagination, sort });
            }
        )
    }
}

export class BaseMutationResolvers extends ResolversManager {

    // names of resolvers
    #updateOneName;
    #updateManyName;
    #deleteOneName;
    #deleteManyName;
    #createName;

    constructor(modelname, { isUpdatable = true, isDeletable = true, isCreatable  = true, isIterrable = true } = {}) {
        super(modelname);

        // configurate names
        this.#updateOneName = `update${this._resolverMarker}`;
        this.#updateManyName = `updateMany${this._resolverMarker}s`;
        this.#deleteOneName = `delete${this._resolverMarker}`;
        this.#deleteManyName = `deleteMany${this._resolverMarker}s`;
        this.#createName = `create${this._resolverMarker}`

        // update one
        isUpdatable && this.addResolver(
            this.#updateOneName, 
            async (_, { id, data }, { dataSources }) => await dataSources.db.updateOne(modelname, { id, data })
        )

        // update many
        isUpdatable && isIterrable && this.addResolver(
            this.#updateManyName,
            async (_, { ids, data }, { dataSources }) => await dataSources.db.updateMany(modelname, { ids, data })
        )

        // delete one
        isDeletable && this.addResolver(
            this.#deleteOneName,
            async (_, { id }, { dataSources }) => await dataSources.db.deleteOne(modelname, { id })
        )

        // delete many
        isDeletable && isIterrable && this.addResolver(
            this.#deleteManyName,
            async (_, { ids }, { dataSources }) => await dataSources.db.deleteMany(modelname, { ids })
        )

        // create instance of model
        isCreatable && this.addResolver(
            this.#createName,
            async (_, { data }, { dataSources }) => await dataSources.db.create(modelname, { data })
        )
    }
}