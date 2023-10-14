import { PromptFormat } from "../../model-function/PromptFormat.js";

export type Automatic1111ImageGenerationPrompt = {
  prompt: string;
  negativePrompt?: string;
  seed?: number;
};

/**
 * Formats a basic text prompt as an Automatic1111 prompt.
 */
export function mapBasicPromptToAutomatic1111Format(): PromptFormat<
  string,
  Automatic1111ImageGenerationPrompt
> {
  return {
    format: (description) => ({ prompt: description }),
  };
}
