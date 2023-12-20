import {
  AnthropicTextGenerationModel,
  AnthropicTextGenerationModelSettings,
} from "./AnthropicTextGenerationModel.js";

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
