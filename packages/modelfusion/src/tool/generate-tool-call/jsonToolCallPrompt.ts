import { nanoid } from "nanoid";
import { parseJSON } from "../../core/schema/parseJSON";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt";
import { ToolDefinition } from "../../tool/ToolDefinition";
import { ToolCallPromptTemplate } from "./ToolCallPromptTemplate";

const DEFAULT_TOOL_PROMPT = (tool: ToolDefinition<string, unknown>) =>
  [
    `You are calling the function "${tool.name}".`,
    tool.description != null
      ? `Function description: ${tool.description}`
      : null,
    `Function parameters JSON schema: ${JSON.stringify(
      tool.parameters.getJsonSchema()
    )}`,
    ``,
    `You MUST answer with a JSON object that matches the JSON schema above.`,
  ]
    .filter(Boolean)
    .join("\n");

export const jsonToolCallPrompt = {
  text({
    toolPrompt,
  }: {
    toolPrompt?: (tool: ToolDefinition<string, unknown>) => string;
  } = {}): ToolCallPromptTemplate<string, InstructionPrompt> {
    return {
      createPrompt(prompt: string, tool: ToolDefinition<string, unknown>) {
        return {
          system: createSystemPrompt({ tool, toolPrompt }),
          instruction: prompt,
        };
      },
      extractToolCall,
      withJsonOutput: ({ model, schema }) => model.withJsonOutput(schema),
    };
  },

  instruction({
    toolPrompt,
  }: {
    toolPrompt?: (tool: ToolDefinition<string, unknown>) => string;
  } = {}): ToolCallPromptTemplate<InstructionPrompt, InstructionPrompt> {
    return {
      createPrompt(
        prompt: InstructionPrompt,
        tool: ToolDefinition<string, unknown>
      ): InstructionPrompt {
        return {
          system: createSystemPrompt({
            originalSystemPrompt: prompt.system,
            tool,
            toolPrompt,
          }),
          instruction: prompt.instruction,
        };
      },
      extractToolCall,
      withJsonOutput: ({ model, schema }) => model.withJsonOutput(schema),
    };
  },
};

function createSystemPrompt({
  originalSystemPrompt,
  toolPrompt = DEFAULT_TOOL_PROMPT,
  tool,
}: {
  originalSystemPrompt?: string;
  toolPrompt?: (tool: ToolDefinition<string, unknown>) => string;
  tool: ToolDefinition<string, unknown>;
}) {
  return [
    originalSystemPrompt,
    originalSystemPrompt != null ? "" : null,
    toolPrompt(tool),
  ]
    .filter(Boolean)
    .join("\n");
}

function extractToolCall(response: string) {
  return { id: nanoid(), args: parseJSON({ text: response }) };
}
