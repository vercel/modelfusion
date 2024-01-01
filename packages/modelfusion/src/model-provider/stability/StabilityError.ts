import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const stabilityErrorDataSchema = z.object({
  message: z.string(),
});

export type StabilityErrorData = z.infer<typeof stabilityErrorDataSchema>;

export const failedStabilityCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(stabilityErrorDataSchema),
    errorToMessage: (error) => error.message,
  });
