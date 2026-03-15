
import logger from "@lib/logger";
import * as responses from "@src/responses";
import { LoggedError } from "@src/errors";

// parse API Response from local error or returns 500 formated Response
export function logErrorAndReturn(error: LoggedError){
    if (error.apiResponse){
        return error.apiResponse;
    }

    logger.error(error.message);

    return responses.f500Response();
}

// these two catchers must be applied only on resolver methods
export function ResolverSaveCatch(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
){
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]){
        try {

            // except directives
            original.name != "resolve" && logger.debug(`Got request on ${ original.name }`);

            return await original.apply(this, args);
        }
        catch (error: any) {
            return logErrorAndReturn(error);
        }
    }
}