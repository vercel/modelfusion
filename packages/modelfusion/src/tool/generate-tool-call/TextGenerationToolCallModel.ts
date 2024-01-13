import { FunctionOptions } from "../../core/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { ToolCallParseError } from "./ToolCallParseError.js";
import { ToolDefinition } from "../ToolDefinition.js";
import { ToolCallGenerationModel } from "./ToolCallGenerationModel.js";

export interface ToolCallPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    tool: ToolDefinition<string, unknown>
  ) => TARGET_PROMPT;
  extractToolCall: (
    response: string,
    tool: ToolDefinition<string, unknown>
  ) => { id: string; args: unknown } | null;
}

export class TextGenerationToolCallModel<
  SOURCE_PROMPT,
  TARGET_PROMPT,
  MODEL extends TextGenerationModel<TARGET_PROMPT, TextGenerationModelSettings>,
> implements ToolCallGenerationModel<SOURCE_PROMPT, MODEL["settings"]>
{
  private readonly model: MODEL;
  private readonly format: ToolCallPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;

  constructor({
    model,
    format,
  }: {
    model: MODEL;
    format: ToolCallPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
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
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { rawResponse, text, metadata } = await generateText({
      model: this.model,
      prompt: this.format.createPrompt(prompt, tool),
      fullResponse: true,
      ...options,
    });

    try {
      return {
        rawResponse,
        toolCall: this.format.extractToolCall(text, tool),
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
        valueText: text,
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
