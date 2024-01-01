import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

const cohereErrorDataSchema = new ZodSchema(
  z.object({
    message: z.string(),
  })
);

export type CohereErrorData = (typeof cohereErrorDataSchema)["_type"];

export const failedCohereCallResponseHandler = createJsonErrorResponseHandler({
  errorSchema: cohereErrorDataSchema,
  errorToMessage: (error) => error.message,
});
