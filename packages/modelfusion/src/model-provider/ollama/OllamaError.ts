import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

const ollamaErrorDataSchema = new ZodSchema(
  z.object({
    error: z.string(),
  })
);

export type OllamaErrorData = (typeof ollamaErrorDataSchema)["_type"];

export const failedOllamaCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: ollamaErrorDataSchema,
    errorToMessage: (error) => error.error,
  });
