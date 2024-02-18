/**
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "gpt-3.5-turbo-instruct": {
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
};

type OpenAICompletionModelType = keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAICompletionResponse = {
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
};

export const calculateOpenAICompletionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAICompletionModelType;
  response: OpenAICompletionResponse;
}) => {
  const modelInformation = OPENAI_TEXT_GENERATION_MODELS[model];

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};

export const isOpenAICompletionModel = (
  model: string
): model is OpenAICompletionModelType => model in OPENAI_TEXT_GENERATION_MODELS;
