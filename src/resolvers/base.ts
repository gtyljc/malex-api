import { formatFResponse } from "../sources";
import { capitalize, assembleErrorMessage } from "../tools";
import * as errors from "../errors";
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
                return await db.getOneById(modelname, id);
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
                        assembleErrorMessage(errors.IdsOrFilterWasNotSpecifiedError)
                    );
                }

                // check if pagination exceeds 
                if (filter && pagination.perPage > parseInt(process.env.OBJECTS_PER_REQUEST_LIMIT)){
                    return formatFResponse(
                        400, 
                        assembleErrorMessage(errors.PaginationLimitationError)
                    );
                }

                // if ids was specified, then return corresponding response
                if (ids){
                    return await db.getManyByIds(modelname, ids, sort)
                }

                // if filter was specified, then use filter + pagination to found result
                if(filter){
                    return await db.getManyByFilter(modelname, filter, pagination, sort)
                }
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
            ): Promise<types.ResponseSchema> => await db.updateById(modelname, id, data)
        )

        // update many
        isUpdatable && isIterrable && this.addResolver(
            this.updateManyName,
            async (
                _, 
                { ids, data }: { ids: string[], data: Object }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.updateManyByIds(modelname, ids, data)
        )

        // delete one
        isDeletable && this.addResolver(
            this.deleteOneName,
            async (
                _, 
                { id }: { id: string }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.deleteById(modelname, id)
        )

        // delete many
        isDeletable && isIterrable && this.addResolver(
            this.deleteManyName,
            async (
                _, 
                { ids }: { ids: string[] }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.deleteManyByIds(modelname, ids)
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