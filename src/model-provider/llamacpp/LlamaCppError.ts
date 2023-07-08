import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { ApiCallError } from "../../util/api/ApiCallError.js";
import { ResponseHandler } from "../../util/api/postToApi.js";

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
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  try {
    const parsedError = llamaCppErrorDataSchema.parse(
      SecureJSON.parse(responseBody)
    );

    return new LlamaCppError({
      url,
      requestBodyValues,
      statusCode: response.status,
      data: parsedError,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error instanceof ApiCallError) {
        throw error;
      }
    }

    throw new ApiCallError({
      message: responseBody,
      cause: error,
      statusCode: response.status,
      url,
      requestBodyValues,
    });
  }
};
