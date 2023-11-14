import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../util/parseJSON.js";

export const anthropicErrorDataSchema = new ZodSchema(
  z.object({
    error: z.object({
      type: z.string(),
      message: z.string(),
    }),
  })
);

export type AnthropicErrorData = (typeof anthropicErrorDataSchema)["_type"];

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
    data: parseJSON({
      text: await response.text(),
      schema: anthropicErrorDataSchema,
    }),
  });
