
import * as types from "./types";

export function f200Response(data: any[]): types.ResponseSchema {    
    return {
        code: 200,
        message: "Success",
        success: true,
        data,
    };
}

export function f500Response(message: string = "Query failed! See more at logs."): types.ResponseSchema {
    return {
        code: 500,
        message,
        success: false,
        data: [],
    };
}

export function f403Response(message: string = "Unauthorizated request!"): types.ResponseSchema {
    return {
        code: 403,
        message,
        success: false,
        data: [],
    };
}

export function f400Response(message: string = "Bad request! Try one more time!"): types.ResponseSchema {
    return {
        code: 400,
        message,
        success: false,
        data: [],
    };
}
