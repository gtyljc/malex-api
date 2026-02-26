
import * as responses from "./responses";
import * as types from "./types/index";
import * as utils from "@lib/utils";
import { env } from "@lib/utils";
import { ASyncResolverSaveCatch } from "@lib/utils";
import * as errors from "@src/errors";

class ResolversManager {
    // !!! if you want to use resolvers in high-defined object use "resolvers" property !!!

    private resolversObject: Record<string, Function> = {};
    protected mutationResolverMarker: string;
    protected queryResolverMarker: string;
    modelname: types.Resource;

    constructor(modelname: types.Resource){
        this.modelname = modelname;
        this.queryResolverMarker = modelname;
        this.mutationResolverMarker = utils.capitalize(modelname); // how resolvers will be marked
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
    protected static getAllMethods(obj: Object): Array<string> { 
        const methods = new Set<string>();

        while (obj && obj !== Object.prototype) { 
            Object.getOwnPropertyNames(obj).filter(
                name => typeof (obj as any)[name] === 'function' && name !== 'constructor' 
            ).forEach(name => methods.add(name));

            obj = Object.getPrototypeOf(obj);
        } 
        return [...methods]; 
    }

    protected register(methods: Array<string>): this {
        for (let method of utils.patch<string>(
            ResolversManager.getAllMethods(this), 
            [

                // except base methods
                "getAllMethods",
                "setResolver",
                "getResolver",
                "register"

            ].concat(methods)
        )){
            this.setResolver(method, (this as any)[method].bind(this));
        }

        return this;
    }
}

export class BaseQueryResolvers extends ResolversManager {
    protected getManyName!: string;
    protected getOneName!: string;
    protected isIterrable: boolean;

    constructor(modelname: types.Resource, { isIterrable = true } = {}) {
        super(modelname);

        this.isIterrable = isIterrable;
    }

    @ASyncResolverSaveCatch
    async getMany(
        _: any,
        { ids, filter, pagination, sort }: types.GetManyArgs,
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {

        // must be specified filter + pagination or ids
        if (!ids && !filter){
            throw new errors.IdsOrFilterWasNotSpecifiedError();
        }

        if (filter && (pagination?.perPage < parseInt(env("PER_PAGE_LIMIT")))){
            throw new errors.PaginationLimitError();
        }

        // if ids was specified, then return corresponding response
        if (ids){
            return (await db.getManyByIds(this.modelname, ids, sort)).apiResponse;
        }

        // if filter was specified, then use filter + pagination for search
        if(filter){
            return (await db.getManyByFilter(this.modelname, filter, pagination, sort)).apiResponse;
        }

        return responses.f400Response();
    }

    @ASyncResolverSaveCatch
    async getOne(
        _: any, 
        { id }: types.GetOneArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {
        return (await db.getOneById(this.modelname, id)).apiResponse;   
    }

    register(): this {

        // configurate names
        this.getOneName = this.queryResolverMarker;
        this.getManyName = this.queryResolverMarker + "s";

        // register resolver to get single entity
        this.setResolver(this.getOneName, this.getOne);

        this.isIterrable && this.setResolver(this.getManyName, this.getMany);

        return super.register([ "getOne", "getMany" ]);
    }
}

export class BaseMutationResolvers extends ResolversManager {

    // names of base mutation resolvers
    protected updateOneName!: string;
    protected updateManyName!: string;
    protected deleteOneName!: string;
    protected deleteManyName!: string;
    protected createName!: string;

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

    @ASyncResolverSaveCatch
    async updateOne(
        _: any, 
        { id, data }: types.UpdateOneArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {
        return (await db.updateById(this.modelname, id, data)).apiResponse;
    }

    @ASyncResolverSaveCatch
    async updateMany(
        _: any, 
        { ids, data }: types.UpdateManyArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {
        return (await db.updateManyByIds(this.modelname, ids, data)).apiResponse

    }

    @ASyncResolverSaveCatch
    async deleteOne(
        _: any, 
        { id }: { id: string }, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {
        return (await db.deleteById(this.modelname, id)).apiResponse;
    }

    @ASyncResolverSaveCatch
    async deleteMany(
        _: any, 
        { ids }: { ids: string[] }, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {
        return (await db.deleteManyByIds(this.modelname, ids)).apiResponse;
    }

    @ASyncResolverSaveCatch
    async create(
        _: any, 
        { data }: types.CreateArgs, 
        { dataSources: { db } }: types.AppContext
    ): Promise<types.APIResponse<any>> {
        return (await db.create(this.modelname, data)).apiResponse;
    }

    register() {

        // configurate names
        this.updateOneName = `update${this.mutationResolverMarker}`;
        this.updateManyName = `updateMany${this.mutationResolverMarker}s`;
        this.deleteOneName = `delete${this.mutationResolverMarker}`;
        this.deleteManyName = `deleteMany${this.mutationResolverMarker}s`;
        this.createName = `create${this.mutationResolverMarker}`

        // update one
        this.isUpdatable && this.setResolver(this.updateOneName, this.updateOne)

        // update many
        this.isUpdatable && this.isIterrable && this.setResolver(this.updateManyName, this.updateMany)

        // delete one
        this.isDeletable && this.setResolver(this.deleteOneName, this.deleteOne)

        // delete many
        this.isDeletable && this.isIterrable && this.setResolver(this.deleteManyName, this.deleteMany)

        // create instance of model
        this.isCreatable && this.setResolver(this.createName, this.create)

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