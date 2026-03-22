
import * as responses from "@lib/responses";
import { type ResponseError } from "@lib/errors";
import { 
    ApolloServerPlugin, 
    BaseContext, 
    GraphQLRequestContextDidEncounterErrors, 
    GraphQLRequestContextWillSendResponse, 
    GraphQLRequestListener 
} from "@apollo/server";
import * as types from "./lib/types/index";
import * as utils from "@lib/utils";
import logger from "@lib/logger";

class ChangeResponseStatusListener implements GraphQLRequestListener<BaseContext> {
    originalError: ResponseError | undefined;

    async didEncounterErrors(requestContext: GraphQLRequestContextDidEncounterErrors<BaseContext>): Promise<void> {
        this.originalError = requestContext.errors[0].originalError as ResponseError;
        let code: number;

        if (!this.originalError.code) code = 500;
        else code = this.originalError.code;

        requestContext.response.http.status = code;
    }

    async willSendResponse(requestContext: GraphQLRequestContextWillSendResponse<BaseContext>): Promise<void> {
        if(this.originalError){
            let apiResponse: types.APIResponse;

            if (!this.originalError.apiResponse) {
                apiResponse = responses.f500Response();
                
                logger.error(this.originalError);
            }
            else apiResponse = this.originalError.apiResponse;

            requestContext.response.body = {
                kind: "single",
                singleResult: {
                    data: { [ utils.lowerFirst(requestContext.request.operationName) ]: apiResponse }
                }
            }
        }
    }
}

export class ChangeResponseStatusPlugin implements ApolloServerPlugin {
    async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {    
        return new ChangeResponseStatusListener();
    }
}