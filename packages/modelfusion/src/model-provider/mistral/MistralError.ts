import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const mistralErrorDataSchema = z.object({
  object: z.literal("error"),
  message: z.string(),
  type: z.string(),
  param: z.string().nullable(),
  code: z.string(),
});

export type MistralErrorData = z.infer<typeof mistralErrorDataSchema>;

export const failedMistralCallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(mistralErrorDataSchema),
    errorToMessage: (error) => error.message,
  });
