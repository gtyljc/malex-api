
import * as responses from "../responses";
import * as types from "../types/index";
import Cloudflare from "cloudflare";

// resolvers for image upload
const resolversSchema: types.ResolversSchema = {
    Mutation: {
        async startImageUpload (_, { id }: { id: string }, { dataSources: { cloudflare } }: types.AppContext){
            const response = await cloudflare.images.v2.directUploads.create(
                { id, account_id: process.env.CLOUDFLARE_ACCOUNT_ID }
            );

            if (response instanceof Cloudflare.APIError){
                return responses.f500Response();
            }
            
            return responses.f200Response([{ id: response.id, url: response.uploadURL}]);
        },

        async finalizeImageUpload (_, { id }: { id: string }, { dataSources: { cloudflare } }: types.AppContext){
            const response = await cloudflare.images.v1.get(
                id,
                { account_id: process.env.CLOUDFLARE_ACCOUNT_ID }
            );

            if (response instanceof Cloudflare.APIError){
                return responses.f500Response();
            }
            
            return responses.f200Response([{ id: response.id, url: response.variants[0] }]);
        }
    }
}

export default resolversSchema;