import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ToolCallDefinition } from "./ToolCallDefinition.js";
import { ToolCallParametersValidationError } from "./ToolCallParametersValidationError.js";
import {
  ToolCallsGenerationModel,
  ToolCallsGenerationModelSettings,
} from "./ToolCallsGenerationModel.js";

export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallsGenerationModelSettings,
>(
  model: ToolCallsGenerationModel<PROMPT, SETTINGS>,
  tool: ToolCallDefinition<NAME, PARAMETERS>,
  prompt: PROMPT | ((tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure" }
): Promise<PARAMETERS>;
export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallsGenerationModelSettings,
>(
  model: ToolCallsGenerationModel<PROMPT, SETTINGS>,
  tool: ToolCallDefinition<NAME, PARAMETERS>,
  prompt: PROMPT | ((tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT),
  options: FunctionOptions & { returnType: "full" }
): Promise<{
  value: PARAMETERS;
  response: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateToolCall<
  PARAMETERS,
  PROMPT,
  NAME extends string,
  SETTINGS extends ToolCallsGenerationModelSettings,
>(
  model: ToolCallsGenerationModel<PROMPT, SETTINGS>,
  tool: ToolCallDefinition<NAME, PARAMETERS>,
  prompt: PROMPT | ((tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT),
  options?: FunctionOptions & { returnType?: "structure" | "full" }
): Promise<
  | PARAMETERS
  | { value: PARAMETERS; response: unknown; metadata: ModelCallMetadata }
> {
  // Note: PROMPT must not be a function.
  const expandedPrompt =
    typeof prompt === "function"
      ? (prompt as (tool: ToolCallDefinition<NAME, PARAMETERS>) => PROMPT)(tool)
      : prompt;

  const fullResponse = await executeStandardCall({
    functionType: "generate-tool-calls",
    input: expandedPrompt,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doGenerateToolCall(
        tool,
        expandedPrompt,
        options
      );

      const parameters = result.value;
      const parseResult = tool.parameters.validate(parameters);

      if (!parseResult.success) {
        throw new ToolCallParametersValidationError({
          toolName: tool.name,
          parameters,
          valueText: result.valueText,
          cause: parseResult.error,
        });
      }

      const parsedParameters = parseResult.data;

      return {
        response: result.response,
        extractedValue: parsedParameters,
        usage: result.usage,
      };
    },
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
