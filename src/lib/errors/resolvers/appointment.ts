
import * as base from "../base";

export class AppointmentCreationError extends Error {
    constructor(){
        super();

        this.message = "Appointment creation failed!";

        return new base.Response400Error(this, "debug");
    }
}