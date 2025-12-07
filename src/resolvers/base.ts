import { formatFResponse } from "../sources";
import { capitalize, assembleErrorMessage } from "../tools";
import { 
    IdsOrFilterWasNotSpecifiedError,
    PaginationIsNotSpecifiedError,
    PaginationLimitationError
} from "../errors";
import * as types from "../types/index";

class ResolversManager {
    // !!! if you want to use resolvers in high-definied object use "resolvers" property !!!

    private resolversObject = {};
    protected resolverMarker: string;

    constructor(modelname: types.Resource){
        this.resolverMarker = capitalize(modelname); // how resolvers will be marked
    }

    addResolver(name: string, func: Function): void {
        this.resolversObject[name] = func;
    }

    get resolvers(){
        return this.resolversObject;
    }
}

export class BaseQueryResolvers extends ResolversManager {
    constructor(modelname: types.Resource, { isIterrable = true } = {}) {
        super(modelname);

        // get single entity
        this.addResolver(
            modelname,
            async (
                _, 
                { id }: { id: string }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => {
                return await db.getOne(modelname, id);
            }
        )

        // get many entities
        isIterrable && this.addResolver(
            modelname + "s",
            async (
                _, 
                { 
                    ids, 
                    filter, 
                    pagination, 
                    sort 
                }: {
                    ids: string[],
                    filter: Object,
                    pagination: types.PaginationInput,
                    sort: types.SortInput
                }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => {

                // if ids or filter wasn't specified
                if (ids === undefined && filter === undefined){
                    return formatFResponse(
                        400,
                        assembleErrorMessage(IdsOrFilterWasNotSpecifiedError)
                    );
                }

                // if filter was specified, but without pagination
                if (filter && pagination === undefined){
                    return formatFResponse(
                        400, 
                        assembleErrorMessage(PaginationIsNotSpecifiedError)
                    );
                }

                // pagination exceeds 
                if (pagination.perPage > parseInt(process.env.OBJECTS_PER_REQUEST_LIMIT)){
                    return formatFResponse(
                        400, 
                        assembleErrorMessage(PaginationLimitationError)
                    );
                }

                return await db.getMany(modelname, { ids, filter, pagination, sort });
            }
        )
    }
}

export class BaseMutationResolvers extends ResolversManager {

    // names of resolvers
    private updateOneName: string;
    private updateManyName: string;
    private deleteOneName: string;
    private deleteManyName: string;
    private createName: string;

    constructor(
        modelname: types.Resource, 
        { 
            isUpdatable = true, 
            isDeletable = true, 
            isCreatable  = true, 
            isIterrable = true 
        } = {}
    ) {
        super(modelname);

        // configurate names
        this.updateOneName = `update${this.resolverMarker}`;
        this.updateManyName = `updateMany${this.resolverMarker}s`;
        this.deleteOneName = `delete${this.resolverMarker}`;
        this.deleteManyName = `deleteMany${this.resolverMarker}s`;
        this.createName = `create${this.resolverMarker}`

        // update one
        isUpdatable && this.addResolver(
            this.updateOneName, 
            async (
                _, 
                { id, data }: { id: string, data: Object }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.updateOne(modelname, id, data)
        )

        // update many
        isUpdatable && isIterrable && this.addResolver(
            this.updateManyName,
            async (
                _, 
                { ids, data }: { ids: string[], data: Object }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.updateMany(modelname, ids, data)
        )

        // delete one
        isDeletable && this.addResolver(
            this.deleteOneName,
            async (
                _, 
                { id }: { id: string }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.deleteOne(modelname, id)
        )

        // delete many
        isDeletable && isIterrable && this.addResolver(
            this.deleteManyName,
            async (
                _, 
                { ids }: { ids: string[] }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.deleteMany(modelname, ids)
        )

        // create instance of model
        isCreatable && this.addResolver(
            this.createName,
            async (
                _, 
                { data }: { data: Object }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.create(modelname, data)
        )
    }
}