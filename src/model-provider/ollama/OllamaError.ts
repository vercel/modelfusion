import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";

export class OllamaError extends ApiCallError {
  public readonly data: string;

  constructor({
    statusCode,
    url,
    requestBodyValues,
    message,
  }: {
    message: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
  }) {
    super({ message, statusCode, requestBodyValues, url });
  }
}

export const failedOllamaCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) =>
  new OllamaError({
    url,
    requestBodyValues,
    statusCode: response.status,
    message: await response.text(),
  });
