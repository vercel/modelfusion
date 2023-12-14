import {
  MistralApiConfiguration,
  MistralApiConfigurationSettings,
} from "./MistralApiConfiguration.js";
import {
  MistralTextEmbeddingModel,
  MistralTextEmbeddingModelSettings,
} from "./MistralTextEmbeddingModel.js";
import {
  MistralTextGenerationModel,
  MistralTextGenerationModelSettings,
} from "./MistralTextGenerationModel.js";

export function Api(settings: MistralApiConfigurationSettings) {
  return new MistralApiConfiguration(settings);
}

export function TextGenerator(settings: MistralTextGenerationModelSettings) {
  return new MistralTextGenerationModel(settings);
}

export function TextEmbedder(settings: MistralTextEmbeddingModelSettings) {
  return new MistralTextEmbeddingModel(settings);
}
