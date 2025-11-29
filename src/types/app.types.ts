
import { DatabaseSource } from "../sources.ts";
import { IncomingMessage } from "http";

export type AppContext = {
    req: IncomingMessage,
    dataSources: { 
        db: DatabaseSource
    }
}
