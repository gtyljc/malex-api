
import { Response500Error } from "./base";

export class DatabaseConnectionError extends Error {
    constructor(){
        super();

        this.message = "Database connection is lost!";

        return new Response500Error(this);
    }
}

export class DatabaseDriverError extends Error {
    constructor(prismaError: Error){
        super();

        this.message = prismaError.stack!;

        return new Response500Error(this);
    }
}