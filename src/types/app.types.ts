
import { DatabaseSource } from "../sources";
import { IncomingMessage } from "http";
import Cloudflare from "cloudflare";

export type AppContext = {
    req: IncomingMessage,
    dataSources: { 
        db: DatabaseSource
        cloudflare: Cloudflare
    }
}
