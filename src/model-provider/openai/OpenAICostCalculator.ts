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
    event,
  }: {
    model: string | null;
    event: SuccessfulModelCall;
  }): Promise<number | null> {
    if (model == null) {
      return null;
    }

    const type = event.type;
    switch (type) {
      case "text-generation-finished": {
        if (isOpenAIChatModel(model)) {
          return calculateOpenAIChatCostInMillicent({
            model,
            output: event.response as OpenAIChatResponse,
          });
        }
        break;
      }

      case "text-embedding-finished": {
        if (isOpenAIEmbeddingModel(model)) {
          return calculateOpenAIEmbeddingCostInMillicent({
            model,
            output: event.response as OpenAITextEmbeddingResponse[],
          });
        }
        break;
      }
    }

    return null;
  }
}
