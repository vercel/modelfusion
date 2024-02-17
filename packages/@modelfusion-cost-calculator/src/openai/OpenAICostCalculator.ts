import {
  OpenAIChatResponse,
  OpenAICompletionResponse,
  OpenAITextEmbeddingResponse,
  OpenAIImageModelType,
  OpenAISpeechModelType,
  OpenAIImageGenerationCallSettings,
  OpenAITranscriptionModelType,
  OpenAITranscriptionVerboseJsonResponse,
  isOpenAIChatModel,
  isOpenAICompletionModel,
  isOpenAIEmbeddingModel,
} from "@modelfusion/types";

import {
  calculateOpenAIChatCostInMillicents,
  calculateOpenAICompletionCostInMillicents,
  calculateOpenAIEmbeddingCostInMillicents,
  calculateOpenAIImageGenerationCostInMillicents,
  calculateOpenAISpeechCostInMillicents,
  calculateOpenAITranscriptionCostInMillicents,
} from "./calculators";

import { CostCalculator } from "../CostCalculator";
import { SuccessfulModelCall } from "../SuccessfulModelCall";

export class OpenAICostCalculator implements CostCalculator {
  readonly provider = "openai";

  async calculateCostInMillicents(
    call: SuccessfulModelCall
  ): Promise<number | null> {
    const type = call.functionType;
    const model = call.model.modelName;

    switch (type) {
      case "generate-image": {
        if (model == null) {
          return null;
        }

        return calculateOpenAIImageGenerationCostInMillicents({
          model: model as OpenAIImageModelType,
          settings: call.settings as OpenAIImageGenerationCallSettings,
        });
      }

      case "embed": {
        if (model == null) {
          return null;
        }

        if (isOpenAIEmbeddingModel(model)) {
          const responses = Array.isArray(call.result.rawResponse)
            ? (call.result.rawResponse as OpenAITextEmbeddingResponse[])
            : [call.result.rawResponse as OpenAITextEmbeddingResponse];

          return calculateOpenAIEmbeddingCostInMillicents({
            model,
            responses,
          });
        }
        break;
      }

      case "generate-object":
      case "generate-text": {
        if (model == null) {
          return null;
        }

        if (isOpenAIChatModel(model)) {
          return calculateOpenAIChatCostInMillicents({
            model,
            response: call.result.rawResponse as OpenAIChatResponse,
          });
        }

        if (isOpenAICompletionModel(model)) {
          return calculateOpenAICompletionCostInMillicents({
            model,
            response: call.result.rawResponse as OpenAICompletionResponse,
          });
        }

        break;
      }

      case "generate-transcription": {
        if (model == null) {
          return null;
        }

        return calculateOpenAITranscriptionCostInMillicents({
          model: model as OpenAITranscriptionModelType,
          response: call.result
            .rawResponse as OpenAITranscriptionVerboseJsonResponse,
        });
      }

      case "generate-speech": {
        if (model == null) {
          return null;
        }
        return calculateOpenAISpeechCostInMillicents({
          model: model as OpenAISpeechModelType,
          input: call.input as string,
        });
      }
    }

    return null;
  }
}
