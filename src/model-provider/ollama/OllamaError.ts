import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { parseJsonWithZod } from "../../util/parseJSON.js";

export const ollamaErrorDataSchema = z.object({
  error: z.string(),
});

export type OllamaErrorData = z.infer<typeof ollamaErrorDataSchema>;

export class OllamaError extends ApiCallError {
  public readonly data: OllamaErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.error,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: OllamaErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedOllamaCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) =>
  new OllamaError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parseJsonWithZod(await response.text(), ollamaErrorDataSchema),
  });
