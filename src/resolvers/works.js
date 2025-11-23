
// resolvers for model "Work"

import { 
    BaseMutationResolvers, 
    BaseQueryResolvers
} from "./base.js";

const __modelname = "work";

export default {
    Query: new BaseQueryResolvers(__modelname).resolvers,
    Mutation: new BaseMutationResolvers(__modelname).resolvers
}