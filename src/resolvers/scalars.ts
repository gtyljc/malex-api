
// add not standart scalars to GraphQL Schema

import { 
    JSONObjectResolver, 
    DateTimeISOResolver,
    PhoneNumberResolver,
    URLResolver,
    PositiveIntResolver,
    PositiveFloatResolver,
    EmailAddressResolver
} from "graphql-scalars";
import * as types from "../types/index.ts";

const scalarsResolvers: types.ResolversSchema = {
    JSONObject: JSONObjectResolver,
    URL: URLResolver,
    PhoneNumber: PhoneNumberResolver,
    DateTimeISO: DateTimeISOResolver,
    PositiveInt: PositiveIntResolver,
    PositiveFloat: PositiveFloatResolver,
    EmailAddress: EmailAddressResolver
}

export default scalarsResolvers;