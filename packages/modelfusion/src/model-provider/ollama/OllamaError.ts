import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const ollamaErrorDataSchema = z.object({
  error: z.string(),
});

export type OllamaErrorData = z.infer<typeof ollamaErrorDataSchema>;

export const failedOllamaCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(ollamaErrorDataSchema),
    errorToMessage: (error) => error.error,
  });
