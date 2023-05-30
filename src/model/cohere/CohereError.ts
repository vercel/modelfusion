import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { ResponseHandler } from "../../internal/postToApi.js";
import { ApiCallError } from "../../util/ApiCallError.js";

const cohereErrorDataSchema = z.object({
  message: z.string(),
});

export type CohereErrorData = z.infer<typeof cohereErrorDataSchema>;

export class CohereError extends ApiCallError {
  public readonly data: CohereErrorData;

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
    data: CohereErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedCohereCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = cohereErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new CohereError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
