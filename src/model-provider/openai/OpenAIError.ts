import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../util/parseJSON.js";

export const openAIErrorDataSchema = new ZodSchema(
  z.object({
    error: z.object({
      message: z.string(),
      type: z.string(),
      param: z.any().nullable(),
      code: z.string().nullable(),
    }),
  })
);

export type OpenAIErrorData = (typeof openAIErrorDataSchema)["_type"];

export class OpenAIError extends ApiCallError {
  public readonly data?: OpenAIErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message,
  }: {
    message: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data?: OpenAIErrorData;
  }) {
    super({
      message,
      statusCode,
      requestBodyValues,
      url,
      isRetryable:
        (statusCode === 429 &&
          // insufficient_quota is also reported as a 429, but it's not retryable:
          data?.error.type !== "insufficient_quota") ||
        statusCode >= 500,
    });

    this.data = data;
  }
}

export const failedOpenAICallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  // resilient parsing in case the response is not JSON or does not match the schema:
  try {
    const parsedError = parseJSON({
      text: responseBody,
      schema: openAIErrorDataSchema,
    });

    return new OpenAIError({
      url,
      requestBodyValues,
      statusCode: response.status,
      message: parsedError.error.message,
      data: parsedError,
    });
  } catch (parseError) {
    return new OpenAIError({
      url,
      requestBodyValues,
      statusCode: response.status,
      message: responseBody.trim() !== "" ? responseBody : response.statusText,
    });
  }
};
