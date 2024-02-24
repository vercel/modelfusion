const EMBEDDING_MODEL_COSTS = {
  "text-embedding-3-small": 0.002,
  "text-embedding-3-large": 0.013,
  "text-embedding-ada-002": 0.01,
};

export type TextEmbeddingResponse = Partial<{
  usage: {
    total_tokens: number;
  };
}>;

type OpenAITextEmbeddingModelType = keyof typeof EMBEDDING_MODEL_COSTS;

export const isOpenAIEmbeddingModel = (
  model: string
): model is OpenAITextEmbeddingModelType => model in EMBEDDING_MODEL_COSTS;

export const calculateOpenAIEmbeddingCostInMillicents = ({
  model,
  responses,
}: {
  model: OpenAITextEmbeddingModelType;
  responses: TextEmbeddingResponse[];
}): number => {
  let amountInMilliseconds = 0;

  for (const response of responses) {
    amountInMilliseconds +=
      response.usage!.total_tokens * EMBEDDING_MODEL_COSTS[model];
  }

  return amountInMilliseconds;
};
