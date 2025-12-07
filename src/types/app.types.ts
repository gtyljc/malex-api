
import { DatabaseSource } from "../sources";
import { IncomingMessage } from "http";

export type AppContext = {
    req: IncomingMessage,
    dataSources: { 
        db: DatabaseSource
    }
}
