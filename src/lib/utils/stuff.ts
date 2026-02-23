
import { DatabaseSource } from "@src/sources";

// returns new string with capitalized first letter
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// stops function on delay, which was in ms specified
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// check if there is no element sin array
export function isEmpty(array: Array<any>): boolean {
    return array.length == 0;
}

// removes element and returns new array
export function patch<Type>(array: Array<Type>, changes: Array<Type>): Array<Type>{
    return array.filter(e => !changes.includes(e));
}

// all case functions must have one argument that respresents deserialization of object;
// each validation case must return array like [ validationResult, nextValue ];
// each case function gets result of previous in the "next" param
export function validate(cases: Array<Function>, args: Object = {}, untilFalse = true): boolean {
    var isValid = true;
    var next: any;

    cases.forEach(
        async (func) => {
            if(isValid){
                let r = func({ ...args, next });

                // for async cases
                r = r instanceof Promise ? await r: r;

                next = r[1];

                if (!r[0] && untilFalse) isValid = false;
            }
        }
    )

    return isValid;
}

export function env(valueName: string){
    return process.env[valueName];
}

export async function getSiteConfig(db: DatabaseSource): Promise<Record<any, any>> {
    return (await db.getOneById("siteConfig", "1")).qResult;
}
