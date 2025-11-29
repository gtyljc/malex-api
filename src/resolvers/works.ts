
// resolvers for model "Work"

import { BaseMutationResolvers, BaseQueryResolvers } from "./base.ts";
import * as types from "../types/index.ts";

const __modelname = "work";

const resolversSchema: types.ResolversSchema = {
    Query: { ...new BaseQueryResolvers(__modelname).resolvers },
    Mutation: { ...new BaseMutationResolvers(__modelname).resolvers }
};

export default resolversSchema;