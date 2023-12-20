import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

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

export const failedOpenAICallResponseHandler = createJsonErrorResponseHandler({
  errorSchema: openAIErrorDataSchema,
  errorToMessage: (error) => error.error.message,
  isRetryable: (error, response) =>
    (response.status === 429 &&
      // insufficient_quota is also reported as a 429, but it's not retryable:
      error.error.type !== "insufficient_quota") ||
    response.status >= 500,
});
