
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function assembleErrorMessage(error: Error): string {
    return `${ error.name }: ${ error.message }`
}