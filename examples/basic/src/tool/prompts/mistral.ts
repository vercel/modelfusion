import {
  InstructionPrompt,
  ToolCallsPromptTemplate,
  ToolDefinition,
  parseJSON,
  zodSchema,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";

export const mistralMultiToolCallPromptTemplate: ToolCallsPromptTemplate<
  string,
  InstructionPrompt
> = {
  createPrompt(
    instruction: string,
    tools: Array<ToolDefinition<string, unknown>>
  ) {
    return {
      system: [
        `Select the most suitable function and parameters ` +
          `from the list of available functions below, based on the user's input. ` +
          `Provide your response in JSON format.`,
        ``,
        `Available functions:`,
        ...tools.flatMap((tool) => [
          ``,
          `${tool.name}:`,
          `  description: ${tool.description ?? ""}`,
          `  parameters: ${JSON.stringify(tool.parameters.getJsonSchema())}`,
        ]),
      ].join("\n"),
      instruction,
    };
  },

  extractToolCallsAndText(response: string) {
    // Mistral models answer with a JSON object with the following structure
    // (when forcing JSON output):
    const json = parseJSON({
      text: response,
      schema: zodSchema(
        z.object({ function: z.string(), parameters: z.any() })
      ),
    });

    return {
      text: null,
      toolCalls: [{ name: json.function, id: nanoid(), args: json.parameters }],
    };
  },
};
