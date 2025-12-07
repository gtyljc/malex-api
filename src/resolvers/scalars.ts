
// add not standart scalars to GraphQL Schema

import { 
    JSONObjectResolver, 
    DateTimeISOResolver,
    PhoneNumberResolver,
    URLResolver,
    PositiveIntResolver,
    PositiveFloatResolver,
    EmailAddressResolver,
    JWTResolver
} from "graphql-scalars";
import * as types from "../types";

const scalarsResolvers: types.ResolversSchema = {
    JSONObject: JSONObjectResolver,
    URL: URLResolver,
    PhoneNumber: PhoneNumberResolver,
    DateTimeISO: DateTimeISOResolver,
    PositiveInt: PositiveIntResolver,
    PositiveFloat: PositiveFloatResolver,
    EmailAddress: EmailAddressResolver,
    JWT: JWTResolver
}

export default scalarsResolvers;