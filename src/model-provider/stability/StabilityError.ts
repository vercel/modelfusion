import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../util/parseJSON.js";

export const stabilityErrorDataSchema = new ZodSchema(
  z.object({
    message: z.string(),
  })
);

export type StabilityErrorData = (typeof stabilityErrorDataSchema)["_type"];

export class StabilityError extends ApiCallError {
  public readonly data: StabilityErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.message,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: StabilityErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedStabilityCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = parseJSON({
    text: responseBody,
    schema: stabilityErrorDataSchema,
  });

  return new StabilityError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
