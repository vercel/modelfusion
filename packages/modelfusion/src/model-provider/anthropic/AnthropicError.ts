import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const anthropicErrorDataSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
  }),
});

export type AnthropicErrorData = z.infer<typeof anthropicErrorDataSchema>;

export const failedAnthropicCallResponseHandler =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(anthropicErrorDataSchema),
    errorToMessage: (error) => error.error.message,
  });
