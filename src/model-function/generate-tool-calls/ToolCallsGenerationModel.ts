import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { ToolCallDefinition } from "./ToolCallDefinition.js";

export interface ToolCallsGenerationModelSettings extends ModelSettings {}

export interface ToolCallsGenerationModel<
  PROMPT,
  SETTINGS extends
    ToolCallsGenerationModelSettings = ToolCallsGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateToolCall(
    tool: ToolCallDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    valueText: string;
    value: Array<{
      id: string;
      parameters: unknown;
    }>;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}
