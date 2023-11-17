import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { ToolDefinition } from "./ToolDefinition.js";

export interface ToolCallsOrTextGenerationModelSettings extends ModelSettings {}

export interface ToolCallsOrTextGenerationModel<
  PROMPT,
  SETTINGS extends ToolCallsOrTextGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateToolCallsOrText(
    tools: Array<ToolDefinition<string, unknown>>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    text: string | null;
    toolCalls: Array<{ id: string; name: string; parameters: unknown }> | null;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}
