
import * as types from "@lib/types";

const DMESSAGE_200 = "Success";
const DMESSAGE_401 = "Credentials are not in request!";
const DMESSAGE_403 = "Access is denied!";
const DMESSAGE_400 = "Request form isn't correct!";
const DMESSAGE_500 = "Server error! See more at logs.";

export function f200Response(data: any[] = [], message = DMESSAGE_200): types.APIResponse<any> {     
    return {
        code: 200,
        message: message,
        success: true,
        data,
    };
}

export function f500Response(message: string = DMESSAGE_500): types.APIResponse<any> {    
    return {
        code: 500,
        message,
        success: false,
        data: [],
    };
}

export function f403Response(message: string = DMESSAGE_403): types.APIResponse<any> {
    return {
        code: 403,
        message,
        success: false,
        data: [],
    };
}

export function f400Response(message: string = DMESSAGE_400): types.APIResponse<any> {
    return {
        code: 400,
        message,
        success: false,
        data: [],
    };
}

export function f401Response(message: string = DMESSAGE_401): types.APIResponse<any> {
    return {
        code: 401,
        message,
        success: false,
        data: [],
    };
}