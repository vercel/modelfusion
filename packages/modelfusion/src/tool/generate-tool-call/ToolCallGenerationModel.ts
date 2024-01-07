import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../../model-function/Model.js";
import { ToolDefinition } from "../ToolDefinition.js";

export interface ToolCallGenerationModelSettings extends ModelSettings {}

export interface ToolCallGenerationModel<
  PROMPT,
  SETTINGS extends
    ToolCallGenerationModelSettings = ToolCallGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateToolCall(
    tool: ToolDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    rawResponse: unknown;
    toolCall: { id: string; args: unknown } | null;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}
