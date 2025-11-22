
import { formatSResponse } from "../data-sources.js";

// resolvers for image upload
export default {
    Mutation: {
        async startImageUpload (_, { img_id }, { dataSources }){
            const r = await dataSources.imgCloudAPI.directUpload(img_id);

            if (r.success){
                return formatSResponse(
                    {
                        id: r.data.id,
                        url: r.data.uploadURL
                    }
                )
            }
                
            return r;
        },

        async finalizeImageUpload (_, { img_id }, { dataSources }){
            const r = await dataSources.imgCloudAPI.imageInfo(img_id);

            if (r.success){
                return formatSResponse(
                    {
                        id: r.data.id,
                        url: r.data.variants[0]
                    }
                )
            }
            
            return r;
        }
    }
}