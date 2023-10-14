import { PromptFormat } from "../PromptFormat.js";

/**
 * Prompt formats format a source prompt into the structure of a target prompt.
 */
export interface TextGenerationPromptFormat<SOURCE_PROMPT, TARGET_PROMPT>
  extends PromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * The texts that should be used as default stop sequences.
   * This is e.g. important for chat formats.
   */
  stopSequences: string[];
}
