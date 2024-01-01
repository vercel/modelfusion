import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { AnthropicApiConfiguration } from "./AnthropicApiConfiguration.js";
import {
  AnthropicTextGenerationModel,
  AnthropicTextGenerationModelSettings,
} from "./AnthropicTextGenerationModel.js";

/**
 * Creates an API configuration for the Anthropic API.
 * It calls the API at https://api.anthropic.com/v1 and uses the `ANTHROPIC_API_KEY` env variable by default.
 */
export function Api(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  }
) {
  return new AnthropicApiConfiguration(settings);
}

/**
 * Create a text generation model that calls the Anthropic API.
 *
 * @see https://docs.anthropic.com/claude/reference/complete_post
 *
 * @return A new instance of {@link AnthropicTextGenerationModel}.
 */
export function TextGenerator(settings: AnthropicTextGenerationModelSettings) {
  return new AnthropicTextGenerationModel(settings);
}
