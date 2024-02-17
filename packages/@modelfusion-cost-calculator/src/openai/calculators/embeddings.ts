import {
  OpenAITextEmbeddingModelType,
  OpenAITextEmbeddingResponse,
  OPENAI_TEXT_EMBEDDING_MODELS,
} from "@modelfusion/types";

export const calculateOpenAIEmbeddingCostInMillicents = ({
  model,
  responses,
}: {
  model: OpenAITextEmbeddingModelType;
  responses: OpenAITextEmbeddingResponse[];
}): number => {
  let amountInMilliseconds = 0;

  for (const response of responses) {
    amountInMilliseconds +=
      response.usage!.total_tokens *
      OPENAI_TEXT_EMBEDDING_MODELS[model].tokenCostInMillicents;
  }

  return amountInMilliseconds;
};
