import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

const stabilityErrorDataSchema = new ZodSchema(
  z.object({
    message: z.string(),
  })
);

export type StabilityErrorData = (typeof stabilityErrorDataSchema)["_type"];

export const failedStabilityCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: stabilityErrorDataSchema,
    errorToMessage: (error) => error.message,
  });
