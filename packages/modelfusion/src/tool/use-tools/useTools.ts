import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeFunctionCall } from "../../core/executeFunctionCall.js";
import { Tool } from "../Tool.js";
import { ToolCall } from "../ToolCall.js";
import { ToolCallError } from "../ToolCallError.js";
import { ToolCallResult } from "../ToolCallResult.js";
import { safeExecuteToolCall } from "../execute-tool/safeExecuteToolCall.js";
import {
  ToolCallsGenerationModel,
  ToolCallsGenerationModelSettings,
} from "../generate-tool-calls/ToolCallsGenerationModel.js";
import { generateToolCalls } from "../generate-tool-calls/generateToolCalls.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

// [ { name: "n", ... } | { ... } ]
type ToolArray<T extends Tool<any, any, any>[]> = T;

// { n: { name: "n", ... }, ... }
type ToToolMap<T extends ToolArray<Tool<any, any, any>[]>> = {
  [K in T[number]["name"]]: Extract<T[number], Tool<K, any, any>>;
};

// limit to only string keys:
type StringKeys<T> = Extract<keyof T, string>;

// { tool: "n", result: ... } | { ... }
type ToToolCallUnion<T> = {
  [KEY in StringKeys<T>]: T[KEY] extends Tool<
    any,
    infer PARAMETERS,
    infer OUTPUT
  >
    ? ToolCallResult<KEY, PARAMETERS, OUTPUT>
    : never;
}[StringKeys<T>];

type ToOutputValue<TOOLS extends ToolArray<Tool<any, any, any>[]>> =
  ToToolCallUnion<ToToolMap<TOOLS>>;

export async function useTools<
  PROMPT,
  TOOLS extends Array<Tool<any, any, any>>,
>({
  model,
  tools,
  prompt,
  ...options
}: {
  model: ToolCallsGenerationModel<PROMPT, ToolCallsGenerationModelSettings>;
  tools: TOOLS;
  prompt: PROMPT | ((tools: TOOLS) => PROMPT);
} & FunctionOptions): Promise<{
  text: string | null;
  toolResults: Array<ToOutputValue<TOOLS>> | null;
}> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tools: TOOLS) => PROMPT)(tools)
      : prompt;

  return executeFunctionCall({
    options,
    input: expandedPrompt,
    functionType: "use-tools",
    execute: async (options) => {
      const modelResponse = await generateToolCalls({
        model,
        tools,
        prompt: expandedPrompt,
        fullResponse: false,
        ...options,
      });

      const { toolCalls, text } = modelResponse;

      // no tool calls:
      if (toolCalls == null) {
        return { text, toolResults: null };
      }

      // execute tools in parallel:
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          const tool = tools.find((tool) => tool.name === toolCall.name);

          if (tool == null) {
            return {
              tool: toolCall.name,
              toolCall,
              args: toolCall.args,
              ok: false,
              result: new ToolCallError({
                message: `No tool with name '${toolCall.name}' found.`,
                toolCall,
              }),
            };
          }

          return await safeExecuteToolCall(
            tool,
            toolCall as ToolCall<
              (typeof tool)["name"],
              (typeof tool)["parameters"]
            >,
            options
          );
        })
      );

      return {
        text,
        toolResults: toolResults as Array<ToOutputValue<TOOLS>>,
      };
    },
  });
}
