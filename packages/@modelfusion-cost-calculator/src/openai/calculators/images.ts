import {
  OpenAIImageModelType,
  OpenAIImageGenerationCallSettings,
  OPENAI_IMAGE_MODELS,
} from "@modelfusion/types";

interface CallSettings extends OpenAIImageGenerationCallSettings {
  numberOfGenerations?: number;
}

/**
 * @see https://openai.com/pricing
 */
export const calculateOpenAIImageGenerationCostInMillicents = ({
  model,
  settings,
}: {
  model: OpenAIImageModelType;
  settings: CallSettings;
}): number | null => {
  const cost = OPENAI_IMAGE_MODELS[model]?.getCost(settings);

  if (cost == null) {
    return null;
  }

  return (settings.numberOfGenerations ?? 1) * cost;
};
