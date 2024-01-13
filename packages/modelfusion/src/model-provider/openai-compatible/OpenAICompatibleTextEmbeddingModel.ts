import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { EmbeddingModel } from "../../model-function/embed/EmbeddingModel.js";
import {
  AbstractOpenAITextEmbeddingModel,
  AbstractOpenAITextEmbeddingModelSettings,
} from "../openai/AbstractOpenAITextEmbeddingModel.js";
import { OpenAICompatibleProviderName } from "./OpenAICompatibleProviderName.js";

export interface OpenAICompatibleTextEmbeddingModelSettings
  extends AbstractOpenAITextEmbeddingModelSettings {
  api: ApiConfiguration; // enforce API configuration
  provider?: OpenAICompatibleProviderName;
  model: string;
  embeddingDimensions?: number;
}

export class OpenAICompatibleTextEmbeddingModel
  extends AbstractOpenAITextEmbeddingModel<OpenAICompatibleTextEmbeddingModelSettings>
  implements EmbeddingModel<string, OpenAICompatibleTextEmbeddingModelSettings>
{
  constructor(settings: OpenAICompatibleTextEmbeddingModelSettings) {
    super(settings);
  }

  get provider(): OpenAICompatibleProviderName {
    return this.settings.provider ?? "openaicompatible";
  }

  get modelName() {
    return this.settings.model;
  }

  get embeddingDimensions() {
    return this.settings.embeddingDimensions;
  }

  get settingsForEvent(): Partial<OpenAICompatibleTextEmbeddingModelSettings> {
    return {
      embeddingDimensions: this.settings.embeddingDimensions,
    };
  }

  withSettings(additionalSettings: OpenAICompatibleTextEmbeddingModelSettings) {
    return new OpenAICompatibleTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
