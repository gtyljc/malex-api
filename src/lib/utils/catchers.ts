
// these two catchers must be applied only on resolver methods

import logger from "@lib/logger";

export function ResolverSaveCatch(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
){
    const original = descriptor.value;
    const mLogger = logger;

    descriptor.value = async function (...args: any[]){        
        try {
            mLogger.info("Got request from");

            return await original.apply(this, args);
        }
        catch (error: any) {
            return error.apiResponse;
        }
    }
}