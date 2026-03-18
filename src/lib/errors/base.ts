

import logger from "@lib/logger";
import * as types from "@lib/types";
import * as responses from "../responses";

type LogLevel = "error" | "debug" | "info";

export const DMESSAGE_403 = "Access is denied!";
export const DMESSAGE_400 = "Request form isn't correct!";
export const DMESSAGE_500 = "Server error! See more at logs.";

interface LoggedError {
    logError (error: Error, logLevel: LogLevel): void
}

class LoggedError extends Error implements LoggedError {
    logError(error: Error, logLevel: LogLevel){
        logger[logLevel](error.name + " : " + error.message);
    }
}

export interface ResponseError extends LoggedError {
    rootError: Error,
    apiResponse: types.APIResponse<any>;
    code: number;
}

export class Response403Error extends LoggedError implements ResponseError {
    rootError: Error;
    apiResponse: types.APIResponse<any>;
    code: number;
    
    constructor(rootError: Error, logLevel: LogLevel = "error"){
        super();
    
        this.rootError = rootError;
        this.apiResponse = responses.f403Response(DMESSAGE_403);
        this.code = 403;

        this.logError(rootError, logLevel);
    }
}

export class Response500Error extends LoggedError implements ResponseError {
    rootError: Error;
    apiResponse: types.APIResponse<any>;
    code: number;
    
    constructor(rootError: Error, logLevel: LogLevel = "error"){
        super();
    
        this.rootError = rootError;
        this.apiResponse = responses.f500Response(DMESSAGE_500);
        this.code = 500;

        this.logError(rootError, logLevel);
    }
}

export class Response400Error extends LoggedError implements ResponseError {
    rootError: Error;
    apiResponse: types.APIResponse<any>;
    code: number;

    constructor(rootError: Error, logLevel: LogLevel = "error"){
        super();
    
        this.rootError = rootError;
        this.apiResponse = responses.f400Response(DMESSAGE_400);
        this.code = 400;

        this.logError(rootError, logLevel);
    }
}