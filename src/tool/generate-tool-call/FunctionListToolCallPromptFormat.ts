import { nanoid } from "nanoid";
import { z } from "zod";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { ToolDefinition } from "../ToolDefinition.js";
import { ToolCallPromptFormat } from "./TextGenerationToolCallModel.js";

const functionSchema = new ZodSchema(
  z.object({
    function: z.string(),
    parameters: z.any(),
  })
);

const DEFAULT_FUNCTION_CALL_PROMPT = [
  ``,
  `Select the most suitable function and parameters ` +
    `from the list of available functions below, based on the user's input. ` +
    `Provide your response in JSON format.`,
  ``,
  `Available functions:`,
].join("\n");

export class FunctionListToolCallPromptFormat
  implements ToolCallPromptFormat<string>
{
  readonly functionCallPrompt: string;

  constructor({
    functionCallPrompt = DEFAULT_FUNCTION_CALL_PROMPT,
  }: { functionCallPrompt?: string } = {}) {
    this.functionCallPrompt = functionCallPrompt;
  }

  createPrompt(
    instruction: string,
    tool: ToolDefinition<string, unknown>
  ): string {
    return [
      instruction,
      this.functionCallPrompt,
      `${tool.name}:`,
      `  description: ${tool.description ?? ""}`,
      `  parameters: ${JSON.stringify(tool.parameters.getJsonSchema())}`,
      ``,
    ].join("\n");
  }

  extractToolCall(response: string) {
    const json = parseJSON({ text: response, schema: functionSchema });
    return {
      id: nanoid(),
      args: json.parameters,
    };
  }
}
