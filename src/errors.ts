
import logger from "@lib/logger";
import * as types from "@lib/types";
import * as responses from "@src/responses";

export class LoggedError extends Error {
    apiResponse!: types.APIResponse<any>;
    code: number;

    logError(logLevel: "error" | "debug" | "info" = "error"){
        // console.log(`Error ${ this.name } was occured! Check logs to get more info.`);

        logger[logLevel](this.message);
    }
}

export class DatabaseConnectionError extends LoggedError {
    constructor(){
        super();

        this.message = "Database connection is lost!";
        this.code = 500;
        this.apiResponse = responses.f500Response();
    
        this.logError();
    }
}

export class DatabaseDriverError extends LoggedError {
    constructor(prismaError: Error){
        super();

        this.message = prismaError.stack!;
        this.code = 500;
        this.apiResponse = responses.f500Response();
        
        this.logError();
    }
}

export class PaginationLimitError extends LoggedError {
    constructor(){
        super();

        this.message = "Pagination is limited to 100 objects per request!";
        this.code = 400;
        this.apiResponse = responses.f400Response(this.message);
        
        this.logError();
    }
}

export class IdsOrFilterWasNotSpecifiedError extends LoggedError {
    constructor(){
        super();

        this.message = "You must specify array of necessary ids or filter with pagination!";
        this.code = 400;
        this.apiResponse = responses.f400Response(this.message);

        this.logError()
    }
}

export class NotAuthenticatedRequestError extends LoggedError {
    constructor(){
        super();

        this.message = "Not authenticated request from user!";
        this.code = 403;
        this.apiResponse = responses.f403Response();

        this.logError()
    }
}

export class JWTValidationError extends LoggedError {
    constructor(jwt: string, error: Error){
        super();

        this.message = `JWT ${ jwt } wasn't validated because of: ${ error.message }`;
        this.apiResponse = responses.f403Response();
        this.code = 403;

        this.logError();
    }
}

export class RTIsNotRegistered extends LoggedError {
    constructor(jwt: string){
        super();

        this.message = `RT ${ jwt } isn't registered at Redis!`;
        this.apiResponse = responses.f403Response();
        this.code = 403;

        this.logError();
    }
}

export class RTCreationError extends LoggedError {
    constructor(apiResponse: types.APIResponse<any>){
        super();

        this.message = `Creation of RT has failed!`;
        this.apiResponse = apiResponse;
        this.code = 400;

        this.logError();
    }
}

export class RTRegistrationError extends LoggedError {
    constructor(hash: string){
        super();

        this.code = 400;
        this.message = `Registration of RT with hash ${ hash } has failed!`;
        this.apiResponse = responses.f500Response();

        this.logError();
    }
}