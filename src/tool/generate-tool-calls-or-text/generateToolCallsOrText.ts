import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../../model-function/ModelCallMetadata.js";
import { executeStandardCall } from "../../model-function/executeStandardCall.js";
import { NoSuchToolDefinitionError } from "../NoSuchToolDefinitionError.js";
import { ToolCallArgumentsValidationError } from "../ToolCallArgumentsValidationError.js";
import { ToolDefinition } from "../ToolDefinition.js";
import {
  ToolCallsOrTextGenerationModel,
  ToolCallsOrTextGenerationModelSettings,
} from "./ToolCallsOrTextGenerationModel.js";

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

export async function generateToolCallsOrText<
  TOOLS extends Array<ToolDefinition<any, any>>,
  PROMPT,
>(
  model: ToolCallsOrTextGenerationModel<
    PROMPT,
    ToolCallsOrTextGenerationModelSettings
  >,
  tools: TOOLS,
  prompt: PROMPT | ((tools: TOOLS) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure" }
): Promise<{
  text: string | null;
  toolCalls: Array<ToOutputValue<TOOLS>> | null;
}>;
export async function generateToolCallsOrText<
  TOOLS extends ToolDefinition<any, any>[],
  PROMPT,
>(
  model: ToolCallsOrTextGenerationModel<
    PROMPT,
    ToolCallsOrTextGenerationModelSettings
  >,
  tools: TOOLS,
  prompt: PROMPT | ((tools: TOOLS) => PROMPT),
  options: FunctionOptions & { returnType?: "full" }
): Promise<{
  value: { text: string | null; toolCalls: Array<ToOutputValue<TOOLS>> };
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateToolCallsOrText<
  TOOLS extends ToolDefinition<any, any>[],
  PROMPT,
>(
  model: ToolCallsOrTextGenerationModel<
    PROMPT,
    ToolCallsOrTextGenerationModelSettings
  >,
  tools: TOOLS,
  prompt: PROMPT | ((tools: TOOLS) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure" | "full" }
): Promise<
  | { text: string | null; toolCalls: Array<ToOutputValue<TOOLS>> | null }
  | {
      value: {
        text: string | null;
        toolCalls: Array<ToOutputValue<TOOLS>> | null;
      };
      response: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (structures: TOOLS) => PROMPT)(tools)
      : prompt;

  const fullResponse = await executeStandardCall<
    {
      text: string | null;
      toolCalls: Array<ToOutputValue<TOOLS>> | null;
    },
    ToolCallsOrTextGenerationModel<
      PROMPT,
      ToolCallsOrTextGenerationModelSettings
    >
  >({
    functionType: "generate-tool-calls-or-text",
    input: expandedPrompt,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateToolCallsOrText(
        tools,
        expandedPrompt,
        options
      );

      const { text, toolCalls: rawToolCalls } = result;

      // no tool calls:
      if (rawToolCalls == null) {
        return {
          response: result.response,
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
        response: result.response,
        extractedValue: {
          text,
          toolCalls: toolCalls as Array<ToOutputValue<TOOLS>>,
        },
        usage: result.usage,
      };
    },
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
