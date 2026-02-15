
// add not standart scalars to GraphQL Schema

import { 
    JSONObjectResolver, 
    DateTimeISOResolver,
    PhoneNumberResolver,
    URLResolver,
    PositiveIntResolver,
    PositiveFloatResolver,
    EmailAddressResolver,
    JWTResolver,
    TimeZoneResolver
} from "graphql-scalars";
import * as types from "../types";

const resolvers: types.Resolvers = {
    JSONObject: JSONObjectResolver,
    URL: URLResolver,
    PhoneNumber: PhoneNumberResolver,
    DateTimeISO: DateTimeISOResolver,
    PositiveInt: PositiveIntResolver,
    PositiveFloat: PositiveFloatResolver,
    EmailAddress: EmailAddressResolver,
    JWT: JWTResolver,
    TimeZone: TimeZoneResolver
}

export default resolvers;