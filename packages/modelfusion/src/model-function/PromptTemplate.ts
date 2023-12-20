/**
 * Prompt templates format a source prompt into the structure of a target prompt.
 */
export interface PromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * Formats the source prompt into the structure of the target prompt.
   */
  format(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
}
