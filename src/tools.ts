
// returns new string with capitalized first letter
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// stops function on delay, which was in ms specified
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// assembles error message from it's name and message ( fields of class )
export function assembleErrorMessage(error: Error): string {
    return `${ error.name }: ${ error.message }`
}

// check if there is no element sin array
export function isEmpty(array: Array<any>): boolean{
    return array.length == 0
}