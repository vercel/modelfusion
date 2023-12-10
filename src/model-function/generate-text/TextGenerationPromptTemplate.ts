import { PromptTemplate } from "../PromptTemplate.js";

/**
 * Prompt templates format a source prompt into the structure of a target prompt.
 */
export interface TextGenerationPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>
  extends PromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * The texts that should be used as default stop sequences.
   * This is e.g. important for chat formats.
   */
  stopSequences: string[];
}
