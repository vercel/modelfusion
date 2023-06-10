import z from "zod";

export const openAITextGenerationResponseSchema = z.object({
  id: z.string(),
  object: z.literal("text_completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      text: z.string(),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAITextGenerationResponse = z.infer<
  typeof openAITextGenerationResponseSchema
>;
