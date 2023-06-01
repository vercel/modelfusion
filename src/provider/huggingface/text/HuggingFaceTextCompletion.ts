import zod from "zod";

export const huggingFaceTextCompletionSchema = zod.array(
  zod.object({
    generated_text: zod.string(),
  })
);

export type HuggingFaceTextCompletion = zod.infer<
  typeof huggingFaceTextCompletionSchema
>;
