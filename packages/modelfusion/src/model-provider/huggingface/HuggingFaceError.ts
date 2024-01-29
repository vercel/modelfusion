import { z } from "zod";
import { createJsonErrorResponseHandler } from "../../core/api/postToApi";
import { zodSchema } from "../../core/schema/ZodSchema";

const huggingFaceErrorDataSchema = z.object({
  error: z.array(z.string()).or(z.string()),
});

export type HuggingFaceErrorData = z.infer<typeof huggingFaceErrorDataSchema>;

export const failedHuggingFaceCallResponseHandler =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(huggingFaceErrorDataSchema),
    errorToMessage: (data) =>
      typeof data.error === "string" ? data.error : data.error.join("\n\n"),
  });
