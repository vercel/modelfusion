import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../../model-function/ModelCallMetadata.js";
import { executeStandardCall } from "../../model-function/executeStandardCall.js";
import { ToolCall } from "../ToolCall.js";
import { ToolCallArgumentsValidationError } from "../ToolCallArgumentsValidationError.js";
import { ToolCallGenerationError } from "../ToolCallGenerationError.js";
import { ToolDefinition } from "../ToolDefinition.js";
import {
  ToolCallGenerationModel,
  ToolCallGenerationModelSettings,
} from "./ToolCallGenerationModel.js";

export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallGenerationModelSettings,
>(
  params: {
    model: ToolCallGenerationModel<PROMPT, SETTINGS>;
    tool: ToolDefinition<NAME, PARAMETERS>;
    prompt: PROMPT | ((tool: ToolDefinition<NAME, PARAMETERS>) => PROMPT);
    fullResponse?: false;
  } & FunctionOptions
): Promise<ToolCall<NAME, PARAMETERS>>;
export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallGenerationModelSettings,
>(
  params: {
    model: ToolCallGenerationModel<PROMPT, SETTINGS>;
    tool: ToolDefinition<NAME, PARAMETERS>;
    prompt: PROMPT | ((tool: ToolDefinition<NAME, PARAMETERS>) => PROMPT);
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  toolCall: ToolCall<NAME, PARAMETERS>;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallGenerationModelSettings,
>({
  model,
  tool,
  prompt,
  fullResponse,
  ...options
}: {
  model: ToolCallGenerationModel<PROMPT, SETTINGS>;
  tool: ToolDefinition<NAME, PARAMETERS>;
  prompt: PROMPT | ((tool: ToolDefinition<NAME, PARAMETERS>) => PROMPT);
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | ToolCall<NAME, PARAMETERS>
  | {
      toolCall: ToolCall<NAME, PARAMETERS>;
      rawResponse: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tool: ToolDefinition<NAME, PARAMETERS>) => PROMPT)(tool)
      : prompt;

  const callResponse = await executeStandardCall({
    functionType: "generate-tool-call",
    input: expandedPrompt,
    model,
    options,
    generateResponse: async (options) => {
      try {
        const result = await model.doGenerateToolCall(
          tool,
          expandedPrompt,
          options
        );

        const toolCall = result.toolCall;

        if (toolCall === null) {
          throw new ToolCallGenerationError({
            toolName: tool.name,
            cause: "No tool call generated.",
          });
        }

        const parseResult = tool.parameters.validate(toolCall.args);

        if (!parseResult.success) {
          throw new ToolCallArgumentsValidationError({
            toolName: tool.name,
            args: toolCall.args,
            cause: parseResult.error,
          });
        }

        return {
          rawResponse: result.rawResponse,
          extractedValue: {
            id: toolCall.id,
            name: tool.name,
            args: parseResult.data,
          },
          usage: result.usage,
        };
      } catch (error) {
        if (
          error instanceof ToolCallArgumentsValidationError ||
          error instanceof ToolCallGenerationError
        ) {
          throw error;
        }

        throw new ToolCallGenerationError({
          toolName: tool.name,
          cause: error,
        });
      }
    },
  });

  return fullResponse
    ? {
        toolCall: callResponse.value,
        rawResponse: callResponse.rawResponse,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
