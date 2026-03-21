

import logger from "@lib/logger";
import * as types from "@lib/types";
import * as responses from "../responses";

type LogLevel = "error" | "debug" | "info";

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
        this.apiResponse = responses.f403Response();
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
        this.apiResponse = responses.f500Response();
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
        this.apiResponse = responses.f400Response();
        this.code = 400;

        this.logError(rootError, logLevel);
    }
}

export class Response401Error extends LoggedError implements ResponseError {
    rootError: Error;
    apiResponse: types.APIResponse<any>;
    code: number;

    constructor(rootError: Error, logLevel: LogLevel = "error"){
        super();
    
        this.rootError = rootError;
        this.apiResponse = responses.f401Response();
        this.code = 401;

        this.logError(rootError, logLevel);
    }
}