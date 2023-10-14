import { ImageGenerationPromptFormat } from "../../model-function/generate-image/ImageGenerationPromptFormat.js";

export type Automatic1111ImageGenerationPrompt = {
  prompt: string;
  negativePrompt?: string;
  seed?: number;
};

/**
 * Formats a basic text prompt as an Automatic1111 prompt.
 */
export function mapBasicPromptToAutomatic1111Prompt(): ImageGenerationPromptFormat<
  string,
  Automatic1111ImageGenerationPrompt
> {
  return {
    format: (description) => ({ prompt: description }),
  };
}
