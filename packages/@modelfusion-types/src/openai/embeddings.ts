import z from "zod";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-3-small": {
    contextWindowSize: 8192,
    dimensions: 1536,
    tokenCostInMillicents: 0.002,
  },
  "text-embedding-3-large": {
    contextWindowSize: 8192,
    dimensions: 3072,
    tokenCostInMillicents: 0.013,
  },

  "text-embedding-ada-002": {
    contextWindowSize: 8192,
    dimensions: 1536,
    tokenCostInMillicents: 0.01,
  },
};

export type OpenAITextEmbeddingModelType =
  keyof typeof OPENAI_TEXT_EMBEDDING_MODELS;

export const isOpenAIEmbeddingModel = (
  model: string
): model is OpenAITextEmbeddingModelType =>
  model in OPENAI_TEXT_EMBEDDING_MODELS;

export const openAITextEmbeddingResponseSchema = z.object({
  object: z.literal("list"),
  data: z.array(
    z.object({
      object: z.literal("embedding"),
      embedding: z.array(z.number()),
      index: z.number(),
    })
  ),
  model: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(), // for openai-compatible models
});

export type OpenAITextEmbeddingResponse = z.infer<
  typeof openAITextEmbeddingResponseSchema
>;
