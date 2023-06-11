import SecureJSON from "secure-json-parse";
import { ResponseHandler } from "../../util/api/postToApi.js";
import { ApiCallError } from "../../util/api/ApiCallError.js";
import {
  HuggingFaceError,
  huggingFaceErrorDataSchema,
} from "./HuggingFaceError.js";

export const failedHuggingFaceCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  try {
    const parsedError = huggingFaceErrorDataSchema.parse(
      SecureJSON.parse(responseBody)
    );

    return new HuggingFaceError({
      url,
      requestBodyValues,
      statusCode: response.status,
      data: parsedError,
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
