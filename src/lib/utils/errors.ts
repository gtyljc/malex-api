
// local errors for tools, that will be not logged
// !!! DO NOT IMPORT THEM NOT FOR UTILS USAGE !!!

import * as z from "zod";

export class EnviromentFileParsingError extends Error {
    constructor(error: z.ZodError){
        super();

        this.message = z.prettifyError(error);
    }    
}

export class EnviromentVariableDoesNotExistError extends Error {
    constructor(valueName: string){
        super()

        this.message = `${ valueName } does not exist at .env file!`
    }
}
