
import logger from "@lib/logger";
import * as responses from "@lib/responses";
import { DMESSAGE_500 } from "@lib/errors";

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
            if (error.apiResponse){
                return error.apiResponse;
            };

            return responses.f500Response(DMESSAGE_500);
        }
    }
}