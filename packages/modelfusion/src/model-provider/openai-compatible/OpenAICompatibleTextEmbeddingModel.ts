import { EmbeddingModel } from "../../model-function/embed/EmbeddingModel.js";
import {
  AbstractOpenAITextEmbeddingModel,
  AbstractOpenAITextEmbeddingModelSettings,
} from "../openai/AbstractOpenAITextEmbeddingModel.js";
import {
  OpenAICompatibleApiConfiguration,
  OpenAICompatibleProviderName,
} from "./OpenAICompatibleApiConfiguration.js";

export interface OpenAICompatibleTextEmbeddingModelSettings
  extends AbstractOpenAITextEmbeddingModelSettings {
  api: OpenAICompatibleApiConfiguration; // required
  provider?: OpenAICompatibleProviderName;
  model: string;
  dimensions?: number;
}

export class OpenAICompatibleTextEmbeddingModel
  extends AbstractOpenAITextEmbeddingModel<OpenAICompatibleTextEmbeddingModelSettings>
  implements EmbeddingModel<string, OpenAICompatibleTextEmbeddingModelSettings>
{
  constructor(settings: OpenAICompatibleTextEmbeddingModelSettings) {
    super(settings);
  }

  get provider(): OpenAICompatibleProviderName {
    return (
      this.settings.provider ?? this.settings.api.provider ?? "openaicompatible"
    );
  }

  get modelName() {
    return this.settings.model;
  }

  get dimensions() {
    return this.settings.dimensions;
  }

  get settingsForEvent(): Partial<OpenAICompatibleTextEmbeddingModelSettings> {
    return {
      dimensions: this.settings.dimensions,
    };
  }

  withSettings(additionalSettings: OpenAICompatibleTextEmbeddingModelSettings) {
    return new OpenAICompatibleTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
