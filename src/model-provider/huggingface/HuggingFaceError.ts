import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { parseJSON } from "../../util/parseJSON.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

export const huggingFaceErrorDataSchema = new ZodSchema(
  z.object({
    error: z.array(z.string()).or(z.string()),
  })
);

export type HuggingFaceErrorData = (typeof huggingFaceErrorDataSchema)["_type"];

export class HuggingFaceError extends ApiCallError {
  public readonly data: HuggingFaceErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = typeof data.error === "string"
      ? data.error
      : data.error.join("\n\n"),
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: HuggingFaceErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedHuggingFaceCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) =>
  new HuggingFaceError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parseJSON({
      text: await response.text(),
      schema: huggingFaceErrorDataSchema,
    }),
  });
