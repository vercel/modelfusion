import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { parseJsonWithZod } from "../../util/parseJSON.js";

export const anthropicErrorDataSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
  }),
});

export type AnthropicErrorData = z.infer<typeof anthropicErrorDataSchema>;

export class AnthropicError extends ApiCallError {
  public readonly data: AnthropicErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.error.message,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: AnthropicErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedAnthropicCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) =>
  new AnthropicError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parseJsonWithZod(await response.text(), anthropicErrorDataSchema),
  });
