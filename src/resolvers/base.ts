import * as responses from "../responses";
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

    // adds or updates resolver in list of resolvers
    setResolver(name: string, func: Function): void {
        this.resolversObject[name] = func;
    }

    // returns resolver from list with specified name
    getResolver(name: string) {
        return this.resolvers[name];
    }

    get resolvers(){
        return this.resolversObject;
    }
}

export class BaseQueryResolvers extends ResolversManager {
    
    // names of base query resolvers
    protected getManyName: string;
    protected getOneName: string;
    
    constructor(modelname: types.Resource, { isIterrable = true } = {}) {
        super(modelname);

        // get single entity
        this.setResolver(
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
        isIterrable && this.setResolver(
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
                    return responses.f400Response(assembleErrorMessage(errors.IdsOrFilterWasNotSpecifiedError));
                }

                // check if pagination exceeds 
                if (filter && pagination.perPage > parseInt(process.env.OBJECTS_PER_REQUEST_LIMIT)){
                    return responses.f400Response(assembleErrorMessage(errors.PaginationLimitationError));
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

    // names of base mutation resolvers
    protected updateOneName: string;
    protected updateManyName: string;
    protected deleteOneName: string;
    protected deleteManyName: string;
    protected createName: string;

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
        isUpdatable && this.setResolver(
            this.updateOneName, 
            async (
                _, 
                { id, data }: { id: string, data: any }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.updateById(modelname, id, data)
        )

        // update many
        isUpdatable && isIterrable && this.setResolver(
            this.updateManyName,
            async (
                _, 
                { ids, data }: { ids: string[], data: any }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.updateManyByIds(modelname, ids, data)
        )

        // delete one
        isDeletable && this.setResolver(
            this.deleteOneName,
            async (
                _, 
                { id }: { id: string }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.deleteById(modelname, id)
        )

        // delete many
        isDeletable && isIterrable && this.setResolver(
            this.deleteManyName,
            async (
                _, 
                { ids }: { ids: string[] }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.deleteManyByIds(modelname, ids)
        )

        // create instance of model
        isCreatable && this.setResolver(
            this.createName,
            async (
                _, 
                { data }: { data: any }, 
                { dataSources: { db } }: types.AppContext
            ): Promise<types.ResponseSchema> => await db.create(modelname, data)
        )
    }
}