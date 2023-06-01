import SecureJSON from "secure-json-parse";
import { ResponseHandler } from "../../../internal/postToApi.js";
import { ApiCallError } from "../../../util/ApiCallError.js";
import {
  HuggingFaceError,
  huggingFaceErrorDataSchema,
} from "../HuggingFaceError.js";

export const failedHuggingFaceCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = huggingFaceErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new HuggingFaceError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
