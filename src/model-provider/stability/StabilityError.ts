import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";

export const stabilityErrorDataSchema = z.object({
  message: z.string(),
});

export type StabilityErrorData = z.infer<typeof stabilityErrorDataSchema>;

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
