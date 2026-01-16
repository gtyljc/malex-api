
import * as types from "@src/types";

export class PaginationLimitationError extends Error {
    static readonly MESSAGE = "Pagination is limited to 100 objects per request!";
    static readonly NAME = "PaginationLimitationError";
}

export class IdsOrFilterWasNotSpecifiedError extends Error {
    static readonly MESSAGE = "You must specify array of necessary ids or filter with pagination!";
    static readonly NAME = "IdsOrFilterWasNotSpecifiedError";
}