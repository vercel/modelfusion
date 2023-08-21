import { ApiCallError } from "../../util/api/ApiCallError.js";
import { ResponseHandler } from "../../util/api/postToApi.js";

export const failedElevenLabsCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  try {
    // TODO implement ElevenLabsError
    return new ApiCallError({
      message: responseBody,
      statusCode: response.status,
      url,
      requestBodyValues,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error instanceof ApiCallError) {
        throw error;
      }
    }

    throw new ApiCallError({
      message: responseBody,
      cause: error,
      statusCode: response.status,
      url,
      requestBodyValues,
    });
  }
};
