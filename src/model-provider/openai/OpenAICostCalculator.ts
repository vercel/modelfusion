import { ProviderCostCalculator } from "../../cost/ProviderCostCalculator.js";
import { SuccessfulModelCall } from "../../cost/SuccessfulModelCall.js";
import {
  OpenAIImageGenerationSettings,
  calculateOpenAIImageGenerationCostInMillcent,
} from "./OpenAIImageGenerationModel.js";
import {
  OpenAITextEmbeddingResponse,
  calculateOpenAIEmbeddingCostInMillicent,
  isOpenAIEmbeddingModel,
} from "./OpenAITextEmbeddingModel.js";
import {
  OpenAITextGenerationResponse,
  calculateOpenAITextGenerationCostInMillicent,
  isOpenAITextGenerationModel,
} from "./OpenAITextGenerationModel.js";
import {
  OpenAIChatResponse,
  calculateOpenAIChatCostInMillicent,
  isOpenAIChatModel,
} from "./chat/OpenAIChatModel.js";

export class OpenAICostCalculator implements ProviderCostCalculator {
  readonly provider = "openai";

  async calculateCostInMillicent({
    model,
    call,
  }: {
    model: string | null;
    call: SuccessfulModelCall;
  }): Promise<number | null> {
    const type = call.type;
    switch (type) {
      case "image-generation": {
        return calculateOpenAIImageGenerationCostInMillcent({
          settings: call.settings as OpenAIImageGenerationSettings,
        });
      }

      case "text-embedding": {
        if (model == null) {
          return null;
        }

        if (isOpenAIEmbeddingModel(model)) {
          return calculateOpenAIEmbeddingCostInMillicent({
            model,
            responses: call.response as OpenAITextEmbeddingResponse[],
          });
        }
        break;
      }

      case "text-generation": {
        if (model == null) {
          return null;
        }

        if (isOpenAIChatModel(model)) {
          return calculateOpenAIChatCostInMillicent({
            model,
            response: call.response as OpenAIChatResponse,
          });
        }

        if (isOpenAITextGenerationModel(model)) {
          return calculateOpenAITextGenerationCostInMillicent({
            model,
            response: call.response as OpenAITextGenerationResponse,
          });
        }

        break;
      }
    }

    return null;
  }
}
