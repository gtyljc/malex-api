
import { ResponseSchema } from "../index";

type ResolversDefinition = {
    [name: string]: Function | Promise<ResponseSchema>
}

// enitity that exports each file ( except base.ts ) 
export type ResolversSchema = {

    // unions, types, interfaces ...
    [name: string]: any,

    Query?: ResolversDefinition, 

    Mutation?: ResolversDefinition
}