
import { DatabaseSource } from "@src/sources";
import { parsedEnv } from "./env";

// returns new string with capitalized first letter
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEmpty(array: Array<any>): boolean {
    return array.length == 0;
}

// removes element and returns new array
export function patch<Type>(array: Array<Type>, changes: Array<Type>): Array<Type>{
    return array.filter(e => !changes.includes(e));
}

// each case can return array like [ validationResult, nextValue ]
// and nextValue can be accessed by argument next in next case func
// or it can return a simple validdation result ( boolean value )
export function validate(cases: Array<Function>, args: Object = {}, untilFalse = true): boolean {
    var isValid = true;
    var next: any;

    cases.forEach(
        async (func) => {
            if(isValid){
                let r = func({ ...args, next });

                // for async cases
                r = r instanceof Promise ? await r: r;

                if(r instanceof Array){
                    next = r[1];

                    if (!r[0] && untilFalse) isValid = false;
                }
                else {
                    next = r;

                    if (!r && untilFalse) isValid = false;
                }
            }
        }
    )

    return isValid;
}

export function env(valueName: string): any | undefined {
    return parsedEnv?.data?.[valueName];
}

export async function getSiteConfig(db: DatabaseSource): Promise<Record<any, any>> {
    return (await db.getOneById("siteConfig", 1)).qResult;
}