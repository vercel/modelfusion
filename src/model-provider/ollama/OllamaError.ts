import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";

const ollamaErrorDataSchema = new ZodSchema(
  z.object({
    error: z.string(),
  })
);

export type OllamaErrorData = (typeof ollamaErrorDataSchema)["_type"];

export const failedOllamaCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  const parsedError = parseJSON({
    text: responseBody,
    schema: ollamaErrorDataSchema,
  });

  return new ApiCallError({
    message: parsedError.error,
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
