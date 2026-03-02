
import logger from "@lib/logger";
import * as types from "@src/types";
import * as responses from "@src/responses";

export class LoggedError extends Error {
    logError(){
        // console.log(`Error ${ this.name } was occured! Check logs to get more info.`);

        logger.error(this.name + " : " + this.message);
    }
}

export class ResolverError extends LoggedError {
    apiResponse!: types.APIResponse<any>;
}

// ------------ non-resolver error

export class DatabaseConnectionError extends LoggedError {
    constructor(){
        super();

        this.message = "Database connection is lost!";
    
        this.logError()
    }
}

// ------------ resolver error

export class DatabaseDriverError extends ResolverError {
    constructor(prismaError: Error){
        super();

        this.message = prismaError.stack!;
        this.apiResponse = responses.f500Response();
        
        this.logError();
    }
}

export class PaginationLimitError extends ResolverError {
    constructor(){
        super();

        this.message = "Pagination is limited to 100 objects per request!";
        this.apiResponse = responses.f400Response(this.message);
        
        this.logError();
    }
}

export class IdsOrFilterWasNotSpecifiedError extends ResolverError {
    constructor(){
        super();

        this.message = "You must specify array of necessary ids or filter with pagination!";
        this.apiResponse = responses.f400Response(this.message);

        this.logError()
    }
}

export class NotAuthenticatedRequestError extends ResolverError {
    constructor(){
        super();

        this.message = "Not authenticated request from user!";
        this.apiResponse = responses.f403Response(this.message);

        this.logError()
    }
}

