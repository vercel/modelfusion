import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ToolCallDefinition } from "./ToolCallDefinition.js";
import { ToolCallParametersValidationError } from "./ToolCallParametersValidationError.js";
import { ToolCallsGenerationError } from "./ToolCallGenerationError.js";
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
  model: ToolCallGenerationModel<PROMPT, SETTINGS>,
  tool: ToolCallDefinition<NAME, PARAMETERS>,
  prompt: PROMPT | ((tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure" }
): Promise<{ id: string; parameters: PARAMETERS }>;
export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallGenerationModelSettings,
>(
  model: ToolCallGenerationModel<PROMPT, SETTINGS>,
  tool: ToolCallDefinition<NAME, PARAMETERS>,
  prompt: PROMPT | ((tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT),
  options: FunctionOptions & { returnType: "full" }
): Promise<{
  value: { id: string; parameters: PARAMETERS };
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallGenerationModelSettings,
>(
  model: ToolCallGenerationModel<PROMPT, SETTINGS>,
  tool: ToolCallDefinition<NAME, PARAMETERS>,
  prompt: PROMPT | ((tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure" | "full" }
): Promise<
  | { id: string; parameters: PARAMETERS }
  | {
      value: { id: string; parameters: PARAMETERS };
      response: unknown;
      metadata: ModelCallMetadata;
    }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT)(tool)
      : prompt;

  const fullResponse = await executeStandardCall({
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

        const toolCall = result.value;

        if (toolCall === null) {
          throw new ToolCallsGenerationError({
            toolName: tool.name,
            cause: "No tool call generated.",
          });
        }

        const parseResult = tool.parameters.validate(toolCall.parameters);

        if (!parseResult.success) {
          throw new ToolCallParametersValidationError({
            toolName: tool.name,
            parameters: toolCall.parameters,
            cause: parseResult.error,
          });
        }

        return {
          response: result.response,
          extractedValue: {
            id: toolCall.id,
            parameters: parseResult.data,
          },
          usage: result.usage,
        };
      } catch (error) {
        if (
          error instanceof ToolCallParametersValidationError ||
          error instanceof ToolCallsGenerationError
        ) {
          throw error;
        }

        throw new ToolCallsGenerationError({
          toolName: tool.name,
          cause: error,
        });
      }
    },
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
