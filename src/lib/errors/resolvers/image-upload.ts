
import * as base from "../base";

export class UploadImageError extends Error {
    constructor(){
        super();

        this.message = "Appointment creation failed, because of time range!";

        return new base.Response500Error(this);
    }
}