import { nanoid } from "nanoid";
import { z } from "zod";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { PromptFormat } from "../../model-function/PromptFormat.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-format/InstructionPrompt.js";
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

export function text(options?: {
  functionCallPrompt?: string;
}): ToolCallPromptFormat<string, string>;
export function text<TARGET_PROMPT>({
  functionCallPrompt,
  baseFormat,
}: {
  functionCallPrompt?: string;
  baseFormat: PromptFormat<string, TARGET_PROMPT>;
}): ToolCallPromptFormat<string, TARGET_PROMPT>;
export function text<TARGET_PROMPT>({
  functionCallPrompt = DEFAULT_FUNCTION_CALL_PROMPT,
  baseFormat,
}: {
  functionCallPrompt?: string;
  baseFormat?: PromptFormat<string, TARGET_PROMPT>;
} = {}):
  | ToolCallPromptFormat<string, TARGET_PROMPT>
  | ToolCallPromptFormat<string, string> {
  return {
    createPrompt(
      instruction: string,
      tool: ToolDefinition<string, unknown>
    ): string {
      const instructionWithFunctionCall = [
        instruction,
        functionCallPrompt,
        `${tool.name}:`,
        `  description: ${tool.description ?? ""}`,
        `  parameters: ${JSON.stringify(tool.parameters.getJsonSchema())}`,
        ``,
      ].join("\n");

      return (baseFormat?.format(instructionWithFunctionCall) ??
        // handled by signature overloading:
        instructionWithFunctionCall) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    },

    extractToolCall(response: string) {
      const json = parseJSON({ text: response, schema: functionSchema });
      return {
        id: nanoid(),
        args: json.parameters,
      };
    },
  } satisfies
    | ToolCallPromptFormat<string, TARGET_PROMPT>
    | ToolCallPromptFormat<string, string>;
}

export function instruction<TARGET_PROMPT>({
  functionCallPrompt = DEFAULT_FUNCTION_CALL_PROMPT,
  baseFormat,
}: {
  functionCallPrompt?: string;
  baseFormat: PromptFormat<InstructionPrompt, TARGET_PROMPT>;
}): ToolCallPromptFormat<InstructionPrompt, TARGET_PROMPT> {
  return {
    createPrompt(
      instruction: InstructionPrompt,
      tool: ToolDefinition<string, unknown>
    ): TARGET_PROMPT {
      const instructionWithFunctionCall = [
        instruction.instruction,
        functionCallPrompt,
        `${tool.name}:`,
        `  description: ${tool.description ?? ""}`,
        `  parameters: ${JSON.stringify(tool.parameters.getJsonSchema())}`,
        ``,
      ].join("\n");

      return baseFormat.format({
        ...instruction,
        instruction: instructionWithFunctionCall,
      });
    },

    extractToolCall(response: string) {
      const json = parseJSON({ text: response, schema: functionSchema });
      return {
        id: nanoid(),
        args: json.parameters,
      };
    },
  };
}
