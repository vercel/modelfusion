import SecureJSON from "secure-json-parse";
import { ResponseHandler } from "../../util/api/postToApi.js";
import { ApiCallError } from "../../util/api/ApiCallError.js";
import { A1111Error, a1111ErrorDataSchema } from "./A1111Error.js";

export const failedA1111CallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = a1111ErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new A1111Error({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
