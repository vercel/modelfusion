import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";

const openAIErrorDataSchema = new ZodSchema(
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

    return new ApiCallError({
      message: parsedError.error.message,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      data: parsedError,
      isRetryable:
        (response.status === 429 &&
          // insufficient_quota is also reported as a 429, but it's not retryable:
          parsedError?.error.type !== "insufficient_quota") ||
        response.status >= 500,
    });
  } catch (parseError) {
    return new ApiCallError({
      message: responseBody.trim() !== "" ? responseBody : response.statusText,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
    });
  }
};
