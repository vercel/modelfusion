import { CostCalculator } from "../../cost/CostCalculator.js";
import { SuccessfulModelCall } from "../../model-function/SuccessfulModelCall.js";
import {
  OpenAIImageGenerationSettings,
  calculateOpenAIImageGenerationCostInMillicents,
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

export class OpenAICostCalculator implements CostCalculator {
  readonly provider = "openai";

  async calculateCostInMillicents(
    call: SuccessfulModelCall
  ): Promise<number | null> {
    const type = call.functionType;
    const model = call.model.modelName;

    switch (type) {
      case "image-generation": {
        return calculateOpenAIImageGenerationCostInMillicents({
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
            responses: call.result.response as OpenAITextEmbeddingResponse[],
          });
        }
        break;
      }

      case "structure-generation":
      case "text-generation": {
        if (model == null) {
          return null;
        }

        if (isOpenAIChatModel(model)) {
          return calculateOpenAIChatCostInMillicents({
            model,
            response: call.result.response as OpenAIChatResponse,
          });
        }

        if (isOpenAITextGenerationModel(model)) {
          return calculateOpenAITextGenerationCostInMillicents({
            model,
            response: call.result.response as OpenAITextGenerationResponse,
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
          response: call.result
            .response as OpenAITranscriptionVerboseJsonResponse,
        });
      }
    }

    return null;
  }
}
