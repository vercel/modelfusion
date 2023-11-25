import { FunctionOptions } from "../../core/FunctionOptions.js";
import { TextGenerationModel } from "../../model-function/generate-text/TextGenerationModel.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { ToolDefinition } from "../ToolDefinition.js";
import {
  ToolCallsOrTextGenerationModel,
  ToolCallsOrTextGenerationModelSettings,
} from "./ToolCallsOrTextGenerationModel.js";
import { ToolCallsOrTextParseError } from "./ToolCallsOrTextParseError.js";

export interface ToolCallsOrGenerateTextPromptFormat<
  SOURCE_PROMPT,
  TARGET_PROMPT,
> {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    tools: Array<ToolDefinition<string, unknown>>
  ) => TARGET_PROMPT;
  extractToolCallsAndText: (response: string) => {
    text: string | null;
    toolCalls: Array<{ id: string; name: string; args: unknown }> | null;
  };
}

export class TextGenerationToolCallsOrGenerateTextModel<
  SOURCE_PROMPT,
  TARGET_PROMPT,
  MODEL extends TextGenerationModel<
    TARGET_PROMPT,
    ToolCallsOrTextGenerationModelSettings
  >,
> implements ToolCallsOrTextGenerationModel<SOURCE_PROMPT, MODEL["settings"]>
{
  private readonly model: MODEL;
  private readonly format: ToolCallsOrGenerateTextPromptFormat<
    SOURCE_PROMPT,
    TARGET_PROMPT
  >;

  constructor({
    model,
    format,
  }: {
    model: MODEL;
    format: ToolCallsOrGenerateTextPromptFormat<SOURCE_PROMPT, TARGET_PROMPT>;
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

  async doGenerateToolCallsOrText(
    tools: Array<ToolDefinition<string, unknown>>,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { response, value, metadata } = await generateText(
      this.model,
      this.format.createPrompt(prompt, tools),
      {
        ...options,
        returnType: "full",
      }
    );

    try {
      const { text, toolCalls } = this.format.extractToolCallsAndText(value);

      return {
        response,
        text,
        toolCalls,
        usage: metadata?.usage as
          | {
              promptTokens: number;
              completionTokens: number;
              totalTokens: number;
            }
          | undefined,
      };
    } catch (error) {
      throw new ToolCallsOrTextParseError({
        valueText: value,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new TextGenerationToolCallsOrGenerateTextModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}
