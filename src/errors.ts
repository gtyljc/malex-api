

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

export class AuthorizationHeaderWasNotSpecifiedError extends Error {
    static message = "You didn't specify the authoriation header!";
    static name = "AuthorizationHeaderWasNotSpecifiedError";
}

export class ClientHasNoPermissions extends Error {
    static message = "Client has no necessary role to use this resource!";
    static name = "ClientHasNoPermissions";
}
