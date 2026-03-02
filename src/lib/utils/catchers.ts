
// these two catchers must be applied only on resolver methods

export function ResolverSaveCatch(
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