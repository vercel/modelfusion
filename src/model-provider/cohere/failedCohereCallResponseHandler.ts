import SecureJSON from "secure-json-parse";
import { ResponseHandler } from "../../util/api/postToApi.js";
import { ApiCallError } from "../../util/api/ApiCallError.js";
import { CohereError, cohereErrorDataSchema } from "./CohereError.js";

export const failedCohereCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = cohereErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new CohereError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
