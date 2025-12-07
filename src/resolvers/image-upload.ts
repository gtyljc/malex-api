
import { formatSResponse, formatFResponse } from "../sources";
import * as types from "../types/index";
import Cloudflare from "cloudflare";

const cloudflareClient = new Cloudflare(
    { 
        apiToken: process.env.CLOUDFLARE_API_TOKEN,
        maxRetries: 3 
    },
);

// resolvers for image upload
const resolversSchema: types.ResolversSchema = {
    Mutation: {
        async startImageUpload (_, { id }: { id: string }, __){
            const response = await cloudflareClient.images.v2.directUploads.create(
                { id, account_id: process.env.CLOUDFLARE_ACCOUNT_ID }
            );

            if (response instanceof Cloudflare.APIError){
                console.log(response); // log error

                return formatFResponse(500);
            }
            
            return formatSResponse([{ id: response.id, url: response.uploadURL}]);
        },

        async finalizeImageUpload (_, { id }: { id: string }, __){
            const response = await cloudflareClient.images.v1.get(
                id,
                { account_id: process.env.CLOUDFLARE_ACCOUNT_ID }
            );

            if (response instanceof Cloudflare.APIError){
                console.log(response); // log error

                return formatFResponse(500);
            }
            
            return formatSResponse([{ id: response.id, url: response.variants[0] }]);
        }
    }
}

export default resolversSchema;