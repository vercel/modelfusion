import {
  OpenAIChatResponse, // AbstractOpenAIChatModel.ts
  OpenAICompletionResponse, // AbstractOpenAICompletionModel.ts
  OpenAIImageGenerationSettings, // OpenAIImageGenerationModel.ts
  OpenAIImageModelType, // OpenAIImageGenerationModel.ts
  OpenAISpeechModelType, // OpenAISpeechModel.ts
  OpenAITextEmbeddingResponse, // AbstractOpenAITextEmbeddingModel.ts
  OpenAITranscriptionModelType, // OpenAITranscriptionModel.ts
  OpenAITranscriptionVerboseJsonResponse, // OpenAITranscriptionModel.ts
  calculateOpenAIChatCostInMillicents, // OpenAIChatModel.ts
  calculateOpenAICompletionCostInMillicents, // OpenAICompletionModel.ts
  calculateOpenAIEmbeddingCostInMillicents, // OpenAITextEmbeddingModel.ts
  calculateOpenAIImageGenerationCostInMillicents, // OpenAIImageGenerationModel.ts
  calculateOpenAISpeechCostInMillicents, // OpenAISpeechModel.ts
  calculateOpenAITranscriptionCostInMillicents, // OpenAITranscriptionModel.ts
  isOpenAIChatModel, // OpenAIChatModel.ts
  isOpenAICompletionModel, // OpenAICompletionModel.ts
  isOpenAIEmbeddingModel, // OpenAITextEmbeddingModel.ts
} from "modelfusion";
import { CostCalculator } from "../CostCalculator";
import { SuccessfulModelCall } from "../SuccessfulModelCall.js";

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
          settings: call.settings as OpenAIImageGenerationSettings,
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
          input: call.input,
        });
      }
    }

    return null;
  }
}
