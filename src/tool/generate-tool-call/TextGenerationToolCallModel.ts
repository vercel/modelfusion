import { FunctionOptions } from "../../core/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { ToolCallParseError } from "../ToolCallParseError.js";
import { ToolDefinition } from "../ToolDefinition.js";
import { ToolCallGenerationModel } from "./ToolCallGenerationModel.js";

export interface ToolCallPromptFormat<PROMPT> {
  createPrompt: (
    prompt: PROMPT,
    tool: ToolDefinition<string, unknown>
  ) => string;
  extractToolCall: (response: string) => { id: string; args: unknown } | null;
}

export class TextGenerationToolCallModel<
  PROMPT,
  MODEL extends TextGenerationModel<string, TextGenerationModelSettings>,
> implements ToolCallGenerationModel<PROMPT, MODEL["settings"]>
{
  private readonly model: MODEL;
  private readonly format: ToolCallPromptFormat<PROMPT>;

  constructor({
    model,
    format,
  }: {
    model: MODEL;
    format: ToolCallPromptFormat<PROMPT>;
  }) {
    this.model = model;
    this.format = format;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  get settingsForEvent(): Partial<MODEL["settings"]> {
    return this.model.settingsForEvent;
  }

  async doGenerateToolCall(
    tool: ToolDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ) {
    const { response, value, metadata } = await generateText(
      this.model,
      this.format.createPrompt(prompt, tool),
      {
        ...options,
        returnType: "full",
      }
    );

    try {
      return {
        response,
        toolCall: this.format.extractToolCall(value),
        usage: metadata?.usage as
          | {
              promptTokens: number;
              completionTokens: number;
              totalTokens: number;
            }
          | undefined,
      };
    } catch (error) {
      throw new ToolCallParseError({
        toolName: tool.name,
        valueText: value,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new TextGenerationToolCallModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}
