
export function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function assembleErrorMessage(error) {
    return `${ error.name }: ${ error.message }`
}