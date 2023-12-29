import { nanoid } from "nanoid";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { ToolDefinition } from "../../tool/ToolDefinition.js";
import { ToolCallPromptTemplate } from "./TextGenerationToolCallModel.js";

export const jsonToolCallPrompt = {
  text(): ToolCallPromptTemplate<string, InstructionPrompt> {
    return {
      createPrompt(instruction: string, tool: ToolDefinition<string, unknown>) {
        return {
          system: [
            `You are calling a function "${tool.name}".`,
            tool.description != null
              ? `  Function description: ${tool.description}`
              : null,
            `  Function parameters JSON schema: ${JSON.stringify(
              tool.parameters.getJsonSchema()
            )}`,
            ``,
            `You MUST answer with a JSON object matches the above schema for the arguments.`,
          ]
            .filter(Boolean)
            .join("\n"),
          instruction,
        };
      },

      extractToolCall(response) {
        return { id: nanoid(), args: parseJSON({ text: response }) };
      },
    };
  },
};
