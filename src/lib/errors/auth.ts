
import * as base from "./base";

export class NotAuthenticatedRequestError extends Error {
    constructor(){
        super();

        this.message = "Not authenticated request from user!";

        return new base.Response403Error(this, "debug");
    }
}

export class JWTValidationError extends Error {
    constructor(jwt: string, error: Error){
        super();

        this.message = `JWT ${ jwt } wasn't validated because of: ${ error.message }`;
        
        return new base.Response403Error(this, "debug");
    }
}

export class RTIsNotRegisteredError extends Error {
    constructor(jwt: string){
        super();

        this.message = `RT ${ jwt } isn't registered at Redis!`;

        return new base.Response403Error(this, "debug");
    }
}

export class RTCreationError extends Error {
    constructor(){
        super();

        this.message = `Creation of RT has failed!`;
    
        return new base.Response500Error(this);
    }
}

export class RTRegistrationError extends Error {
    constructor(hash: string){
        super();

        this.message = `Registration of RT with hash ${ hash } has failed!`;
    
        return new base.Response500Error(this);
    }
}

export class RequestCredentialsAbsenceError extends Error {
    constructor(){
        super();

        this.message = `Credentials are not in request!`;
    
        return new base.Response400Error(this, "debug");
    }
}

export class ClientIsNotSuperUserError extends Error {
    constructor(){
        super();

        this.message = `Access is blocked, because client is not Superuser!`;
    
        return new base.Response403Error(this, "debug");
    }
}