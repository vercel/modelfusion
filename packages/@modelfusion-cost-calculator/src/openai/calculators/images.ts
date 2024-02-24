export const OPENAI_IMAGE_MODELS = {
  "dall-e-2": {
    getCost(settings: OpenAIImageGenerationCallSettings) {
      switch (settings.size ?? "1024x1024") {
        case "1024x1024":
          return 2000;
        case "512x512":
          return 1800;
        case "256x256":
          return 1600;
        default:
          return null;
      }
    },
  },
  "dall-e-3": {
    getCost(settings: OpenAIImageGenerationCallSettings) {
      switch (settings.quality ?? "standard") {
        case "standard": {
          switch (settings.size ?? "1024x1024") {
            case "1024x1024":
              return 4000;
            case "1024x1792":
            case "1792x1024":
              return 8000;
            default:
              return null;
          }
        }
        case "hd": {
          switch (settings.size ?? "1024x1024") {
            case "1024x1024":
              return 8000;
            case "1024x1792":
            case "1792x1024":
              return 12000;
            default:
              return null;
          }
        }
      }
    },
  },
};

export type OpenAIImageModelType = keyof typeof OPENAI_IMAGE_MODELS;

export interface OpenAIImageGenerationCallSettings {
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
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
  settings: OpenAIImageGenerationCallSettings;
}): number | null => {
  const cost = OPENAI_IMAGE_MODELS[model]?.getCost(settings);

  if (cost == null) {
    return null;
  }

  return (settings.numberOfGenerations ?? 1) * cost;
};
