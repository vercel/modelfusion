import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const anthropicErrorDataSchema = zodSchema(
  z.object({
    error: z.object({
      type: z.string(),
      message: z.string(),
    }),
  })
);

export type AnthropicErrorData = (typeof anthropicErrorDataSchema)["_type"];

export const failedAnthropicCallResponseHandler =
  createJsonErrorResponseHandler({
    errorSchema: anthropicErrorDataSchema,
    errorToMessage: (error) => error.error.message,
  });
