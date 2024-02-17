import {
  OpenAICompletionModelType,
  OpenAICompletionResponse,
  getOpenAICompletionModelInformation,
} from "@modelfusion/types";

export const calculateOpenAICompletionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAICompletionModelType;
  response: OpenAICompletionResponse;
}) => {
  const modelInformation = getOpenAICompletionModelInformation(model);

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};
