import { ProviderCostCalculator } from "../../cost/ProviderCostCalculator.js";
import { SuccessfulModelCall } from "../../cost/SuccessfulModelCall.js";
import {
  OpenAIImageGenerationSettings,
  calculateOpenAIImageGenerationCostInMillcent,
} from "./OpenAIImageGenerationModel.js";
import {
  OpenAITextEmbeddingResponse,
  calculateOpenAIEmbeddingCostInMillicents,
  isOpenAIEmbeddingModel,
} from "./OpenAITextEmbeddingModel.js";
import {
  OpenAITextGenerationResponse,
  calculateOpenAITextGenerationCostInMillicents,
  isOpenAITextGenerationModel,
} from "./OpenAITextGenerationModel.js";
import {
  OpenAITranscriptionModelType,
  OpenAITranscriptionVerboseJsonResponse,
  calculateOpenAITranscriptionCostInMillicents,
} from "./OpenAITranscriptionModel.js";
import {
  OpenAIChatResponse,
  calculateOpenAIChatCostInMillicents,
  isOpenAIChatModel,
} from "./chat/OpenAIChatModel.js";

export class OpenAICostCalculator implements ProviderCostCalculator {
  readonly provider = "openai";

  async calculateCostInMillicents({
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
          return calculateOpenAIEmbeddingCostInMillicents({
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
          return calculateOpenAIChatCostInMillicents({
            model,
            response: call.response as OpenAIChatResponse,
          });
        }

        if (isOpenAITextGenerationModel(model)) {
          return calculateOpenAITextGenerationCostInMillicents({
            model,
            response: call.response as OpenAITextGenerationResponse,
          });
        }

        break;
      }

      case "transcription": {
        if (model == null) {
          return null;
        }

        return calculateOpenAITranscriptionCostInMillicents({
          model: model as OpenAITranscriptionModelType,
          response: call.response as OpenAITranscriptionVerboseJsonResponse,
        });
      }
    }

    return null;
  }
}
