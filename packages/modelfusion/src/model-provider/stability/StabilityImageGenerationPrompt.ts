import { PromptTemplate } from "../../model-function/PromptTemplate.js";

export type StabilityImageGenerationPrompt = Array<{
  text: string;
  weight?: number;
}>;

/**
 * Formats a basic text prompt as a Stability prompt.
 */
export function mapBasicPromptToStabilityFormat(): PromptTemplate<
  string,
  StabilityImageGenerationPrompt
> {
  return {
    format: (description) => [{ text: description }],
  };
}
