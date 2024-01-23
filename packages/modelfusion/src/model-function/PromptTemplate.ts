/**
 * Prompt templates format a source prompt as a target prompt.
 */
export interface PromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * Formats the source prompt as a target prompt.
   */
  format(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
}
