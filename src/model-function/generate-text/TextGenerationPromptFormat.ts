/**
 * Prompt formats format a source prompt into the structure of a target prompt.
 */
export interface TextGenerationPromptFormat<SOURCE_PROMPT, TARGET_PROMPT> {
  /**
   * Formats the source prompt into the structure of the target prompt.
   */
  format(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;

  /**
   * The texts that should be used as default stop sequences.
   * This is e.g. important for chat formats.
   */
  stopSequences: string[];
}
