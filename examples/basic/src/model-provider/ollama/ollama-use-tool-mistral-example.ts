import dotenv from "dotenv";
import {
  OllamaTextGenerationModel,
  TextGenerationToolCallModel,
  ToolCallTextPromptFormat,
  ToolDefinition,
  ZodSchema,
  parseJSON,
  useTool,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

// schema for prompt
const functionSchema = new ZodSchema(
  z.object({
    function: z.string(),
    params: z.any(),
  })
);

class CalculatorFunctionPromptFormat
  implements ToolCallTextPromptFormat<string>
{
  createPrompt(
    instruction: string,
    tool: ToolDefinition<string, unknown>
  ): string {
    // map parameters JSON schema
    const properties: Record<string, { type: string; description: string }> = (
      tool.parameters.getJsonSchema() as any
    ).properties; // unsafe, assuming 1 level deep
    return [
      `As an AI assistant, please select the most suitable function and parameters ` +
        `from the list of available functions below, based on the user's input. ` +
        `Provide your response in JSON format.`,
      ``,
      `Available functions:`,
      `${tool.name}:`,
      `  description: ${tool.description ?? ""}`,
      `  params:`,
      // Note: Does support nested schemas yet
      ...Object.entries(properties).map(
        ([name, { type, description }]) =>
          `    ${name}: (${type}) ${description}`
      ),
      ``,
      `Input: ${instruction}`,
      ``,
    ].join("\n");
  }

  extractToolCall(response: string) {
    const json = parseJSON({ text: response, schema: functionSchema });
    return {
      id: nanoid(),
      args: json.params,
    };
  }
}

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    new TextGenerationToolCallModel({
      model: new OllamaTextGenerationModel({
        model: "mistral",
        format: "json",
        temperature: 0,
      }),
      format: new CalculatorFunctionPromptFormat(),
    }),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
