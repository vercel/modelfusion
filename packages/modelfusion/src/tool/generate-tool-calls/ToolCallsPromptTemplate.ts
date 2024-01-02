import { ToolDefinition } from "../ToolDefinition.js";

export interface ToolCallsPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    tools: Array<ToolDefinition<string, unknown>>
  ) => TARGET_PROMPT;
  extractToolCallsAndText: (response: string) => {
    text: string | null;
    toolCalls: Array<{ id: string; name: string; args: unknown }> | null;
  };
}
