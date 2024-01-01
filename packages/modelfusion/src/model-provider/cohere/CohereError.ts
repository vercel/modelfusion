import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const cohereErrorDataSchema = zodSchema(
  z.object({
    message: z.string(),
  })
);

export type CohereErrorData = (typeof cohereErrorDataSchema)["_type"];

export const failedCohereCallResponseHandler = createJsonErrorResponseHandler({
  errorSchema: cohereErrorDataSchema,
  errorToMessage: (error) => error.message,
});
