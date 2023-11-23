import dotenv from "dotenv";
import {
  ToolCallPromptFormat,
  ToolDefinition,
  ZodSchema,
  ollama,
  parseJSON,
  useTool,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

const mistralSingleToolCallPromptFormat: ToolCallPromptFormat<string, string> =
  {
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

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    ollama
      .TextGenerator({
        model: "mistral",
        format: "json",
        temperature: 0,
      })
      .asToolCallGenerationModel(mistralSingleToolCallPromptFormat),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
