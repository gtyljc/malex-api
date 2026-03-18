
import * as base from "../base";

export class AdminWasNotFoundError extends Error {
    constructor(){
        super();

        this.message = "Admin doesn't exist!";

        return new base.Response403Error(this, "debug");
    }
}