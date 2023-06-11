import { ResponseHandler } from "internal/postToApi.js";
import SecureJSON from "secure-json-parse";
import { ApiCallError } from "../../util/ApiCallError.js";
import { OpenAIError, openAIErrorDataSchema } from "./OpenAIError.js";

export const failedOpenAICallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = openAIErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new OpenAIError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
