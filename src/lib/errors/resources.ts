
import * as base from "./base";

export class PaginationLimitError extends Error {
    constructor(){
        super();

        this.message = "Pagination is limited to 100 objects per request!";

        return new base.Response400Error(this, "debug");
    }
}

export class IdsOrFilterWasNotSpecifiedError extends Error {
    constructor(){
        super();

        this.message = "You must specify array of necessary ids or filter with pagination!";

        return new base.Response400Error(this, "debug");
    }
}