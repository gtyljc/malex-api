
// add not standart scalars to Graphql schema

import { 
    JSONObjectResolver, 
    DateTimeISOResolver,
    PhoneNumberResolver,
    URLResolver,
    PositiveIntResolver,
    PositiveFloatResolver
} from "graphql-scalars";

export default {
    JSONObject: JSONObjectResolver,
    URL: URLResolver,
    PhoneNumber: PhoneNumberResolver,
    DateTimeISO: DateTimeISOResolver,
    PositiveInt: PositiveIntResolver,
    PositiveFloat: PositiveFloatResolver,
}