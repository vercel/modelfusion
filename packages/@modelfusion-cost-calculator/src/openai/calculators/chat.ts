import {
  getOpenAIChatModelInformation,
  OpenAIChatModelType,
} from "@modelfusion/types";

type OpenAIChatResponse = {
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
};

export const calculateOpenAIChatCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAIChatModelType;
  response: OpenAIChatResponse;
}): number | null => {
  const { promptTokenCostInMillicents, completionTokenCostInMillicents } =
    getOpenAIChatModelInformation(model);

  // null: when cost is unknown, e.g. for fine-tuned models where the price is not yet known
  if (
    promptTokenCostInMillicents == null ||
    completionTokenCostInMillicents == null
  ) {
    return null;
  }

  return (
    response.usage.prompt_tokens * promptTokenCostInMillicents +
    response.usage.completion_tokens * completionTokenCostInMillicents
  );
};
