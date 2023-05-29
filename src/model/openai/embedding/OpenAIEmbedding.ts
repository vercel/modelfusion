import zod from "zod";

export const openAIEmbeddingSchema = zod.object({
  object: zod.literal("list"),
  data: zod
    .array(
      zod.object({
        object: zod.literal("embedding"),
        embedding: zod.array(zod.number()),
        index: zod.number(),
      })
    )
    .length(1),
  model: zod.string(),
  usage: zod.object({
    prompt_tokens: zod.number(),
    total_tokens: zod.number(),
  }),
});

export type OpenAIEmbedding = zod.infer<typeof openAIEmbeddingSchema>;
