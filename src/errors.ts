
export class PaginationLimitationError extends Error {
    static message = "Pagination is limited to 100 objects per request!";
    static name = "PaginationLimitationError";
}

export class IdsOrFilterWasNotSpecifiedError extends Error {
    static message = "You must specify array of necessary ids or filter with pagination!";
    static name = "IdsOrFilterWasNotSpecifiedError";
}