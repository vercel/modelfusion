import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi";
import { zodSchema } from "../../core/schema/ZodSchema";

const cohereErrorDataSchema = z.object({
  message: z.string(),
});

export type CohereErrorData = z.infer<typeof cohereErrorDataSchema>;

export const failedCohereCallResponseHandler = createJsonErrorResponseHandler({
  errorSchema: zodSchema(cohereErrorDataSchema),
  errorToMessage: (error) => error.message,
});
