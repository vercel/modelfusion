import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

export const llamaCppErrorDataSchema = new ZodSchema(
  z.object({
    error: z.string(),
  })
);

export type LlamaCppErrorData = (typeof llamaCppErrorDataSchema)["_type"];

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
    data: parseJSON({
      text: await response.text(),
      schema: llamaCppErrorDataSchema,
    }),
  });
