import {
  ToolCallPromptFormat,
  ToolDefinition,
  ZodSchema,
  parseJSON,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";

export const mistralSingleToolCallPromptFormat: ToolCallPromptFormat<
  string,
  string
> = {
  createPrompt(instruction: string, tool: ToolDefinition<string, unknown>) {
    return [
      instruction,
      ``,
      `Select the most suitable function and parameters ` +
        `from the list of available functions below, based on the user's input. ` +
        `Provide your response in JSON format.`,
      ``,
      `Available functions:`,
      `${tool.name}:`,
      `  description: ${tool.description ?? ""}`,
      `  parameters: ${JSON.stringify(tool.parameters.getJsonSchema())}`,
      ``,
    ].join("\n");
  },

  extractToolCall(response: string) {
    const json = parseJSON({
      text: response,
      schema: new ZodSchema(
        z.object({ function: z.string(), parameters: z.any() })
      ),
    });
    return { id: nanoid(), args: json.parameters };
  },
};
