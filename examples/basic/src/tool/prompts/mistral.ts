import {
  InstructionPrompt,
  ToolCallPromptTemplate,
  ToolDefinition,
  parseJSON,
  zodSchema,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";

export const mistralMultiToolCallPromptTemplate: ToolCallPromptTemplate<
  string,
  InstructionPrompt
> = {
  createPrompt(instruction: string, tool: ToolDefinition<string, unknown>) {
    return {
      system: [
        `Select the most suitable function and parameters ` +
          `from the list of available functions below, based on the user's input. ` +
          `Provide your response in JSON format.`,
        ``,
        `Available functions:`,
        `${tool.name}:`,
        `  description: ${tool.description ?? ""}`,
        `  parameters: ${JSON.stringify(tool.parameters.getJsonSchema())}`,
      ].join("\n"),
      instruction,
    };
  },

  extractToolCall(response: string) {
    const json = parseJSON({
      text: response,
      schema: zodSchema(
        z.object({ function: z.string(), parameters: z.any() })
      ),
    });
    return { id: nanoid(), args: json.parameters };
  },
};
