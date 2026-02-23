
import { logger } from "./app";

export class LoggedError extends Error {
    logError(){
        logger.error(this.name + " : " + this.message)
    }
}

export class PaginationLimitationError extends LoggedError {
    readonly message: string;
    readonly name: string;
    
    constructor(){
        super();

        this.message = "Pagination is limited to 100 objects per request!";
        this.name = "PaginationLimitationError"
        
        this.logError();
    }
}

export class IdsOrFilterWasNotSpecifiedError extends LoggedError {
    readonly message: string;
    readonly name: string;
    
    constructor(){
        super();

        this.message = "You must specify array of necessary ids or filter with pagination!";
        this.name = "IdsOrFilterWasNotSpecifiedError"

        this.logError()
    }
}

export class NotAuthenticatedRequestError extends LoggedError {
    readonly message: string;
    readonly name: string;
    
    constructor(){
        super();

        this.message = "Not authenticated request from user!";
        this.name = "NotAuthenticatedRequestError";
    
        this.logError()
    }
}