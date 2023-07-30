/**
 * Prompt mappings map a source prompt format to a target prompt format.
 */
export interface PromptMapping<SOURCE_PROMPT, TARGET_PROMPT> {
  map(sourcePrompt: SOURCE_PROMPT): TARGET_PROMPT;
  stopTokens: string[];
}
