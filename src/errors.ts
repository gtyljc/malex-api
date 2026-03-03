
import logger from "@lib/logger";
import * as types from "@src/types";
import * as responses from "@src/responses";

export class LoggedError extends Error {
    apiResponse!: types.APIResponse<any>;

    logError(logLevel: "error" | "debug" | "info" = "error"){
        // console.log(`Error ${ this.name } was occured! Check logs to get more info.`);

        logger[logLevel](this.name + " : " + this.message);
    }
}

export class DatabaseConnectionError extends LoggedError {
    constructor(){
        super();

        this.message = "Database connection is lost!";
        this.apiResponse = responses.f500Response();
    
        this.logError()
    }
}

export class DatabaseDriverError extends LoggedError {
    constructor(prismaError: Error){
        super();

        this.message = prismaError.stack!;
        this.apiResponse = responses.f500Response();
        
        this.logError();
    }
}

export class PaginationLimitError extends LoggedError {
    constructor(){
        super();

        this.message = "Pagination is limited to 100 objects per request!";
        this.apiResponse = responses.f400Response(this.message);
        
        this.logError();
    }
}

export class IdsOrFilterWasNotSpecifiedError extends LoggedError {
    constructor(){
        super();

        this.message = "You must specify array of necessary ids or filter with pagination!";
        this.apiResponse = responses.f400Response(this.message);

        this.logError()
    }
}

export class NotAuthenticatedRequestError extends LoggedError {
    constructor(){
        super();

        this.message = "Not authenticated request from user!";
        this.apiResponse = responses.f403Response();

        this.logError()
    }
}

export class JWTValidationError extends LoggedError {
    constructor(){
        super();

        this.message = "Specified JWT has not correct form!";
        this.apiResponse = responses.f400Response();

        this.logError("debug");
    }
}

export class RTRegistrationError extends LoggedError {
    constructor(hash: string){
        super();

        this.message = `Registration of RT with hash ${ hash } has failed!`;
        this.apiResponse = responses.f500Response();

        this.logError();
    }
}