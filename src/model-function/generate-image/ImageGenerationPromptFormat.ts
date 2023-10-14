/**
 * Prompt formats format a source prompt into the structure of a target prompt.
 */
export interface ImageGenerationPromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * Formats the source prompt into the structure of the target prompt.
   */
  format(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
}
