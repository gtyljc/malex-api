
import * as responses from "@lib/responses";
import * as types from "@lib/types/index";
import Cloudflare from "cloudflare";
import { env } from "@lib/utils";
import * as errors from "@lib/errors";

// resolvers for image upload
const resolvers: types.Resolvers = {
    Mutation: {
        async startImageUpload (
            _, 
            { id }: types.MutationStartImageUploadArgs, 
            { dataSources: { cloudflare } }: types.AppContext
        ): Promise<types.APIResponse<types.StartUploadImageType>>{
            const response = await cloudflare.images.v2.directUploads.create(
                { id, account_id: env("CLOUDFLARE_ACCOUNT_ID") }
            );

            if (response instanceof Cloudflare.APIError){
                throw new errors.UploadImageError();
            }
            
            return responses.f200Response([{ id: response.id, url: response.uploadURL }]);
        },

        async finalizeImageUpload (
            _, 
            { id }: types.MutationFinalizeImageUploadArgs, 
            { dataSources: { cloudflare } }: types.AppContext
        ): Promise<types.APIResponse<types.FinalizeUploadImageType>>{
            const response = await cloudflare.images.v1.get(
                id, { account_id: env("CLOUDFLARE_ACCOUNT_ID") }
            );

            if (response instanceof Cloudflare.APIError){
                throw new errors.UploadImageError();
            }
            
            return responses.f200Response([{ id: response.id, url: response.variants![0] }]);
        }
    }
}

export default resolvers;