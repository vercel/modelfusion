import {
  calculateOpenAIChatCostInMillicents,
  calculateOpenAICompletionCostInMillicents,
  calculateOpenAIEmbeddingCostInMillicents,
  calculateOpenAIImageGenerationCostInMillicents,
  calculateOpenAISpeechCostInMillicents,
  calculateOpenAITranscriptionCostInMillicents,
  isOpenAIEmbeddingModel,
  TextEmbeddingResponse,
  OpenAISpeechModelType,
  TranscriptionResponse,
  OpenAITranscriptionModelType,
  OpenAIImageModelType,
  OpenAIImageGenerationCallSettings,
  OpenAICompletionResponse,
  isOpenAICompletionModel,
  OpenAIChatResponse,
  isOpenAIChatModel,
} from "./calculators";

import { CostCalculator } from "../CostCalculator";
import { SuccessfulModelCall } from "../SuccessfulModelCall";

export class OpenAICostCalculator implements CostCalculator {
  readonly provider = "openai";

  async calculateCostInMillicents(
    call: SuccessfulModelCall
  ): Promise<number | null> {
    const { model, functionType, result } = call;
    const { modelName } = model;
    const { rawResponse } = result;

    switch (functionType) {
      case "generate-image": {
        if (modelName == null) {
          return null;
        }

        return calculateOpenAIImageGenerationCostInMillicents({
          model: modelName as OpenAIImageModelType,
          settings: call.settings as OpenAIImageGenerationCallSettings,
        });
      }

      case "embed": {
        if (modelName == null) {
          return null;
        }

        if (isOpenAIEmbeddingModel(modelName)) {
          const responses = Array.isArray(call.result.rawResponse)
            ? (rawResponse as TextEmbeddingResponse[])
            : [rawResponse as TextEmbeddingResponse];

          return calculateOpenAIEmbeddingCostInMillicents({
            model: modelName,
            responses,
          });
        }
        break;
      }

      case "generate-object":
      case "generate-text": {
        if (modelName == null) {
          return null;
        }

        if (isOpenAIChatModel(modelName)) {
          return calculateOpenAIChatCostInMillicents({
            model: modelName,
            response: rawResponse as OpenAIChatResponse,
          });
        }

        if (isOpenAICompletionModel(modelName)) {
          return calculateOpenAICompletionCostInMillicents({
            model: modelName,
            response: rawResponse as OpenAICompletionResponse,
          });
        }

        break;
      }

      case "generate-transcription": {
        if (modelName == null) {
          return null;
        }

        return calculateOpenAITranscriptionCostInMillicents({
          model: modelName as OpenAITranscriptionModelType,
          response: call.result.rawResponse as TranscriptionResponse,
        });
      }

      case "generate-speech": {
        if (modelName == null) {
          return null;
        }
        return calculateOpenAISpeechCostInMillicents({
          model: modelName as OpenAISpeechModelType,
          input: call.input as string,
        });
      }
    }

    return null;
  }
}
