import SecureJSON from "secure-json-parse";
import { ResponseHandler } from "../../internal/postToApi.js";
import { ApiCallError } from "../../util/ApiCallError.js";
import { StabilityError, stabilityErrorDataSchema } from "./StabilityError.js";

export const failedStabilityCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = stabilityErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new StabilityError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
