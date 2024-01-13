import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../../model-function/ModelCallMetadata.js";
import { executeStandardCall } from "../../model-function/executeStandardCall.js";
import { NoSuchToolDefinitionError } from "../NoSuchToolDefinitionError.js";
import { ToolCallArgumentsValidationError } from "../ToolCallArgumentsValidationError.js";
import { ToolDefinition } from "../ToolDefinition.js";
import {
  ToolCallsGenerationModel,
  ToolCallsGenerationModelSettings,
} from "./ToolCallsGenerationModel.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

// [ { name: "n", parameters: Schema<PARAMETERS> } | { ... } ]
type ToolCallDefinitionArray<T extends ToolDefinition<any, any>[]> = T;

// { n: { name: "n", parameters: Schema<PARAMETERS> }, ... }
type ToToolCallDefinitionMap<
  T extends ToolCallDefinitionArray<ToolDefinition<any, any>[]>,
> = {
  [K in T[number]["name"]]: Extract<T[number], ToolDefinition<K, any>>;
};

// { tool: "n", parameters: PARAMETERS } | ...
type ToToolCallUnion<T> = {
  [KEY in keyof T]: T[KEY] extends ToolDefinition<any, infer PARAMETERS>
    ? { id: string; name: KEY; args: PARAMETERS }
    : never;
}[keyof T];

type ToOutputValue<
  TOOL_CALLS extends ToolCallDefinitionArray<ToolDefinition<any, any>[]>,
> = ToToolCallUnion<ToToolCallDefinitionMap<TOOL_CALLS>>;

export async function generateToolCalls<
  TOOLS extends Array<ToolDefinition<any, any>>,
  PROMPT,
>(
  params: {
    model: ToolCallsGenerationModel<PROMPT, ToolCallsGenerationModelSettings>;
    tools: TOOLS;
    prompt: PROMPT | ((tools: TOOLS) => PROMPT);
    fullResponse?: false;
  } & FunctionOptions
): Promise<{
  text: string | null;
  toolCalls: Array<ToOutputValue<TOOLS>> | null;
}>;
export async function generateToolCalls<
  TOOLS extends ToolDefinition<any, any>[],
  PROMPT,
>(
  params: {
    model: ToolCallsGenerationModel<PROMPT, ToolCallsGenerationModelSettings>;
    tools: TOOLS;
    prompt: PROMPT | ((tools: TOOLS) => PROMPT);
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  value: { text: string | null; toolCalls: Array<ToOutputValue<TOOLS>> };
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateToolCalls<
  TOOLS extends ToolDefinition<any, any>[],
  PROMPT,
>({
  model,
  tools,
  prompt,
  fullResponse,
  ...options
}: {
  model: ToolCallsGenerationModel<PROMPT, ToolCallsGenerationModelSettings>;
  tools: TOOLS;
  prompt: PROMPT | ((tools: TOOLS) => PROMPT);
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | { text: string | null; toolCalls: Array<ToOutputValue<TOOLS>> | null }
  | {
      value: {
        text: string | null;
        toolCalls: Array<ToOutputValue<TOOLS>> | null;
      };
      rawResponse: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (structures: TOOLS) => PROMPT)(tools)
      : prompt;

  const callResponse = await executeStandardCall<
    {
      text: string | null;
      toolCalls: Array<ToOutputValue<TOOLS>> | null;
    },
    ToolCallsGenerationModel<PROMPT, ToolCallsGenerationModelSettings>
  >({
    functionType: "generate-tool-calls",
    input: expandedPrompt,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateToolCalls(
        tools,
        expandedPrompt,
        options
      );

      const { text, toolCalls: rawToolCalls } = result;

      // no tool calls:
      if (rawToolCalls == null) {
        return {
          rawResponse: result.rawResponse,
          extractedValue: { text, toolCalls: null },
          usage: result.usage,
        };
      }

      // map tool calls:
      const toolCalls = rawToolCalls.map((rawToolCall) => {
        const tool = tools.find((tool) => tool.name === rawToolCall.name);

        if (tool == undefined) {
          throw new NoSuchToolDefinitionError({
            toolName: rawToolCall.name,
            parameters: rawToolCall.args,
          });
        }

        const parseResult = tool.parameters.validate(rawToolCall.args);

        if (!parseResult.success) {
          throw new ToolCallArgumentsValidationError({
            toolName: tool.name,
            args: rawToolCall.args,
            cause: parseResult.error,
          });
        }

        return {
          id: rawToolCall.id,
          name: tool.name,
          args: parseResult.data,
        };
      });

      return {
        rawResponse: result.rawResponse,
        extractedValue: {
          text,
          toolCalls: toolCalls as Array<ToOutputValue<TOOLS>>,
        },
        usage: result.usage,
      };
    },
  });

  return fullResponse ? callResponse : callResponse.value;
}
