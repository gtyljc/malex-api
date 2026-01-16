import * as responses from "./responses";
import { capitalize, assembleErrorMessage } from "./tools";
import * as errors from "./errors";
import * as types from "./types/index";
import * as tools from "./tools";

class ResolversManager {
    // !!! if you want to use resolvers in high-definied object use "resolvers" property !!!

    private resolversObject = {};
    protected mutationResolverMarker: string;
    protected queryResolverMarker: string;
    modelname: types.Resource;

    constructor(modelname: types.Resource){
        this.modelname = modelname;
        this.queryResolverMarker = modelname;
        this.mutationResolverMarker = capitalize(modelname); // how resolvers will be marked
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

    // get all methods from object
    protected getAllMethods(obj: Object) { 
        const methods = new Set();

        while (obj && obj !== Object.prototype) { 
            Object.getOwnPropertyNames(obj).filter(
                name => typeof obj[name] === 'function' && name !== 'constructor' 
            ).forEach(name => methods.add(name));

            obj = Object.getPrototypeOf(obj);
        } 
        return [...methods]; 
    }

    protected register(methods: Array<string>) {
        for (let method of tools.patch(
            this.getAllMethods(this), 
            [

                // except base methods
                "getAllMethods",
                "setResolver",
                "getResolver",
                "register"

            ].concat(methods)
        )){
            this.setResolver(method, this[method]());
        }

        return this;
    }
}

export class BaseQueryResolvers extends ResolversManager {
    
    // names of base query resolvers
    protected getManyName: string;
    protected getOneName: string;

    protected isIterrable: boolean;

    constructor(modelname: types.Resource, { isIterrable = true } = {}) {
        super(modelname);

        this.isIterrable = isIterrable;
    }

    getMany() {
        const modelname = this.modelname;
        
        async function inner(
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
        ) {

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

        return inner;
    }

    getOne() {
        const modelname = this.modelname;

        async function inner(
            _, 
            { id }: { id: string }, 
            { dataSources: { db } }: types.AppContext
        ): Promise<types.ResponseSchema> {
            return await db.getOneById(modelname, id);   
        }

        return inner;
    }

    register() {

        // configurate names
        this.getOneName = this.queryResolverMarker;
        this.getManyName = this.queryResolverMarker + "s";

        // register resolver to get single entity
        this.setResolver(this.getOneName, this.getOne())

        // register resolver to get list
        this.isIterrable && this.setResolver(this.getManyName, this.getMany())

        return super.register([ "getOne", "getMany" ]);
    }
}

export class BaseMutationResolvers extends ResolversManager {

    // names of base mutation resolvers
    protected updateOneName: string;
    protected updateManyName: string;
    protected deleteOneName: string;
    protected deleteManyName: string;
    protected createName: string;

    protected isUpdatable: boolean;
    protected isDeletable: boolean; 
    protected isCreatable: boolean; 
    protected isIterrable: boolean;

    constructor(
        modelname: types.Resource, 
        { 
            isUpdatable = true, 
            isDeletable = true, 
            isCreatable = true, 
            isIterrable = true 
        } = {}
    ) {
        super(modelname);

        this.isUpdatable = isUpdatable;
        this.isDeletable = isDeletable;
        this.isCreatable = isCreatable;
        this.isIterrable = isIterrable;
    }

    updateOne(){
        const modelname = this.modelname;

        async function inner(
            _, 
            { id, data }: { id: string, data: any }, 
            { dataSources: { db } }: types.AppContext
        ) {
            return await db.updateById(modelname, id, data);
        }

        return inner;
    }

    updateMany(){
        const modelname = this.modelname;

        async function inner(
             _, 
            { ids, data }: { ids: string[], data: any }, 
            { dataSources: { db } }: types.AppContext
        ) {
            return await db.updateManyByIds(modelname, ids, data)
        }

        return inner;

    }

    deleteOne(){
        const modelname = this.modelname;

        async function inner(
            _, 
            { id }: { id: string }, 
            { dataSources: { db } }: types.AppContext
        ) {
            return await db.deleteById(modelname, id);
        }

        return inner;
    }

    deleteMany() {
        const modelname = this.modelname;

        async function inner(
             _, 
            { ids }: { ids: string[] }, 
            { dataSources: { db } }: types.AppContext
        ) {
            return await db.deleteManyByIds(modelname, ids)
        }

        return inner;
    }

    create() {
        const modelname = this.modelname;

        async function inner(
            _, 
            { data }: { data: any }, 
            { dataSources: { db } }: types.AppContext
        ) {
            return await db.create(modelname, data)
        }

        return inner;
    }

    register() {

        // configurate names
        this.updateOneName = `update${this.mutationResolverMarker}`;
        this.updateManyName = `updateMany${this.mutationResolverMarker}s`;
        this.deleteOneName = `delete${this.mutationResolverMarker}`;
        this.deleteManyName = `deleteMany${this.mutationResolverMarker}s`;
        this.createName = `create${this.mutationResolverMarker}`

        // update one
        this.isUpdatable && this.setResolver(this.updateOneName, this.updateOne())

        // update many
        this.isUpdatable && this.isIterrable && this.setResolver(this.updateManyName, this.updateMany())

        // delete one
        this.isDeletable && this.setResolver(this.deleteOneName, this.deleteOne())

        // delete many
        this.isDeletable && this.isIterrable && this.setResolver(this.deleteManyName, this.deleteMany())

        // create instance of model
        this.isCreatable && this.setResolver(this.createName, this.create())

        return super.register(
            [ 
                "updateOne",
                "updateMany",
                "deleteOne",
                "deleteMany",
                "create"
            ]
        );
    }
}