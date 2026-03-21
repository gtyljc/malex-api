
import * as base from "./base";

export class NotAuthenticatedRequestError extends Error {
    constructor(){
        super("Not authenticated request from user!");

        this.name = "NotAuthenticatedRequestError";

        return new base.Response403Error(this, "debug");
    }
}

export class NoCredentialsAtRequestError extends Error {
    constructor(){
        super("No credentials at current request!");

        this.name = "NoCredentialsAtRequestError";

        return new base.Response401Error(this, "debug");
    }
}

export class JWTValidationError extends Error {
    constructor(jwt: string, error: Error){
        super(`JWT ${ jwt } wasn't validated because of: ${ error.message }`);

        this.name = "JWTValidationError";

        return new base.Response403Error(this, "debug");
    }
}

export class RTIsNotRegisteredError extends Error {
    constructor(jwt: string){
        super(`RT ${ jwt } isn't registered at Redis!`);

        this.name = "RTIsNotRegisteredError";

        return new base.Response403Error(this, "debug");
    }
}

export class RTCreationError extends Error {
    constructor(){
        super(`Creation of RT has failed!`);
        
        this.name = "RTCreationError";

        return new base.Response500Error(this);
    }
}

export class RTRegistrationError extends Error {
    constructor(hash: string){
        super(`Registration of RT with hash ${ hash } has failed!`);
        
        this.name = "RTRegistrationError";

        return new base.Response500Error(this);
    }
}

export class ClientIsNotSuperUserError extends Error {
    constructor(){
        super(`Access is blocked, because client is not Superuser!`);

        this.name = "ClientIsNotSuperUserError";
    
        return new base.Response403Error(this, "debug");
    }
}