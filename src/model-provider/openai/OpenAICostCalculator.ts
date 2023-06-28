import { ProviderCostCalculator } from "../../cost/ProviderCostCalculator.js";
import { SuccessfulModelCall } from "../../cost/SuccessfulModelCall.js";
import {
  OpenAITextEmbeddingResponse,
  calculateOpenAIEmbeddingCostInMillicent,
  isOpenAIEmbeddingModel,
} from "./OpenAITextEmbeddingModel.js";
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
    if (model == null) {
      return null;
    }

    const type = call.type;
    switch (type) {
      case "text-generation": {
        if (isOpenAIChatModel(model)) {
          return calculateOpenAIChatCostInMillicent({
            model,
            response: call.response as OpenAIChatResponse,
          });
        }
        break;
      }

      case "text-embedding": {
        if (isOpenAIEmbeddingModel(model)) {
          return calculateOpenAIEmbeddingCostInMillicent({
            model,
            responses: call.response as OpenAITextEmbeddingResponse[],
          });
        }
        break;
      }
    }

    return null;
  }
}
