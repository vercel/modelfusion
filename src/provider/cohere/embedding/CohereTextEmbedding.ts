import zod from "zod";

export const cohereTextEmbeddingSchema = zod.object({
  id: zod.string(),
  texts: zod.array(zod.string()),
  embeddings: zod.array(zod.array(zod.number())),
  meta: zod.object({
    api_version: zod.object({
      version: zod.string(),
    }),
  }),
});

export type CohereTextEmbedding = zod.infer<typeof cohereTextEmbeddingSchema>;
