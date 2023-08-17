/**
 * Prompt formats format a source prompt into the structure of a target prompt.
 */
export interface PromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * Formats the source prompt into the structure of the target prompt.
   */
  format(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;

  /**
   * The tokens that should be used as default stop tokens.
   * This is e.g. important for chat formats.
   */
  stopTokens: string[];
}
