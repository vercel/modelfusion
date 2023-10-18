import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { parseJsonWithZod } from "../../util/parseJSON.js";

export const llamaCppErrorDataSchema = z.object({
  error: z.string(),
});

export type LlamaCppErrorData = z.infer<typeof llamaCppErrorDataSchema>;

export class LlamaCppError extends ApiCallError {
  public readonly data: LlamaCppErrorData;

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
    data: LlamaCppErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedLlamaCppCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) =>
  new LlamaCppError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parseJsonWithZod(await response.text(), llamaCppErrorDataSchema),
  });
