import { PromptFormat } from "../../model-function/PromptFormat.js";

export type StabilityImageGenerationPrompt = Array<{
  text: string;
  weight?: number;
}>;

/**
 * Formats a basic text prompt as a Stability prompt.
 */
export function mapBasicPromptToStabilityFormat(): PromptFormat<
  string,
  StabilityImageGenerationPrompt
> {
  return {
    format: (description) => [{ text: description }],
  };
}
