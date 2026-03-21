
import { Response500Error } from "./base";

export class DatabaseConnectionError extends Error {
    constructor(){
        super("Database connection is lost!");

        this.name = "DatabaseConnectionError";

        return new Response500Error(this);
    }
}

export class DatabaseDriverError extends Error {
    constructor(prismaError: Error){
        super(prismaError.stack!);

        this.name = "DatabaseDriverError";

        return new Response500Error(this);
    }
}