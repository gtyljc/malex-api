
import * as base from "./base";

export class PaginationLimitError extends Error {
    constructor(){
        super("Pagination is limited to 100 objects per request!");

        this.name = "PaginationLimitError";

        return new base.Response400Error(this, "debug");
    }
}

export class IdsOrFilterWasNotSpecifiedError extends Error {
    constructor(){
        super("You must specify array of necessary ids or filter with pagination!");

        this.name = "IdsOrFilterWasNotSpecifiedError";

        return new base.Response400Error(this, "debug");
    }
}