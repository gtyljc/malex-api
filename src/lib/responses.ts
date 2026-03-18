
import * as types from "@lib/types";

export function f200Response(data: any[] = []): types.APIResponse<any> {     
    return {
        code: 200,
        message: "Success",
        success: true,
        data,
    };
}

export function f500Response(message: string): types.APIResponse<any> {    
    return {
        code: 500,
        message,
        success: false,
        data: [],
    };
}

export function f403Response(message: string): types.APIResponse<any> {
    return {
        code: 403,
        message,
        success: false,
        data: [],
    };
}

export function f400Response(message: string): types.APIResponse<any> {
    return {
        code: 400,
        message,
        success: false,
        data: [],
    };
}
