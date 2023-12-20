import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

const mistralErrorDataSchema = new ZodSchema(
  z.object({
    object: z.literal("error"),
    message: z.string(),
    type: z.string(),
    param: z.string().nullable(),
    code: z.string(),
  })
);

export type MistralErrorData = (typeof mistralErrorDataSchema)["_type"];

export const failedMistralCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: mistralErrorDataSchema,
    errorToMessage: (error) => error.message,
  });
