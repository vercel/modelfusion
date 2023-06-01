import zod from "zod";

export const huggingFaceTextGenerationResponseSchema = zod.array(
  zod.object({
    generated_text: zod.string(),
  })
);

export type HuggingFaceTextGenerationResponse = zod.infer<
  typeof huggingFaceTextGenerationResponseSchema
>;
