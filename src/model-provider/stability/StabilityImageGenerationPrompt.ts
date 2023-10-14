import { ImageGenerationPromptFormat } from "../../model-function/generate-image/ImageGenerationPromptFormat.js";

export type StabilityImageGenerationPrompt = Array<{
  text: string;
  weight?: number;
}>;

/**
 * Formats a basic text prompt as a Stability prompt.
 */
export function mapBasicPromptToStabilityFormat(): ImageGenerationPromptFormat<
  string,
  StabilityImageGenerationPrompt
> {
  return {
    format: (description) => [{ text: description }],
  };
}
