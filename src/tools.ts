
// returns new string with capitalized first letter
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// stops function on delay, which was in ms specified
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// assembles error message from it's name and message ( fields of class )
export function assembleErrorMessage(error: any): string {
    return `${ error.NAME }: ${ error.MESSAGE }`
}

// check if there is no element sin array
export function isEmpty(array: Array<any>): boolean {
    return array.length == 0;
}

// removes element and returns new array
export function patch<Type>(array: Array<Type>, changes: Array<Type>): Array<Type>{
    return array.filter(e => !changes.includes(e));
}

// converts IPv6 to IPv4
export function normalizeIp(ip: string): string {
    
    // IPv4-mapped IPv6 -> IPv4
    if (ip.startsWith("::ffff:")) return ip.slice(7);

    return ip;
}

// checks was request from localhost sent
export function isFromLocalhost(senderIP: string): boolean {
    const ip = normalizeIp(senderIP);

    if (ip === "127.0.0.1") return true; // IPv4 

    if (ip === "::1") return true; // IPv6

    return false;
}

// checks is request from backend sent
export function isSentFromBackend(senderIP: string): boolean {
    return senderIP == process.env.BACKEND_IP || isFromLocalhost(senderIP)
}

// parses jwt token from header ( deletes 'Bearer' keyword )
export function getJWTFromHeader(header: string): string {
    return header.replace("Bearer ", "")
}

// all case functions must have one argument that respresents deserialization of object;,
// each validation case must return array like [ validationResult, nextValue ];
// each case function gets result of previous in the "next" value
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