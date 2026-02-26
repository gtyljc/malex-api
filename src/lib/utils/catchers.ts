
// these two catchers must be applied only on resolver methods

export function SyncResolverSaveCatch(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
){
    const original = descriptor.value;
    
    descriptor.value = function (...args: any[]){    
        try {
            return original.apply(this, args);
        }
        catch (error: any) {
            return error.apiResponse;
        }
    }
}

export function ASyncResolverSaveCatch(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
){
    const original = descriptor.value;
    
    descriptor.value = async function (...args: any[]){
        try {
            return await original.apply(this, args);
        }
        catch (error: any) {
            return error.apiResponse;
        }
    }
}