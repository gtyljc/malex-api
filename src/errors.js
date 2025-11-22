

export class PaginationIsNotSpecifiedError extends Error {
    static message = "Pagination param was not specified!";
    static name = "PaginationIsNotSpecifiedError";
}

export class PaginationLimitationError extends Error {
    static message = "Pagination is limited to 100 objects per request!";
    static name = "PaginationLimitationError";
}

export class IdsOrFilterWasNotSpecifiedError extends Error {
    static message = "You must specify array of necessary ids or filter with pagination!";
    static name = "IdsOrFilterWasNotSpecifiedError";
}