import { FunctionOptions } from "../../core/FunctionOptions";
import { TextGenerationModel } from "../../model-function/generate-text/TextGenerationModel";
import { generateText } from "../../model-function/generate-text/generateText";
import { ToolDefinition } from "../ToolDefinition";
import {
  ToolCallsGenerationModel,
  ToolCallsGenerationModelSettings,
} from "./ToolCallsGenerationModel";
import { ToolCallsPromptTemplate } from "./ToolCallsPromptTemplate";
import { ToolCallsParseError } from "./ToolCallsParseError";

export class TextGenerationToolCallsModel<
  SOURCE_PROMPT,
  TARGET_PROMPT,
  MODEL extends TextGenerationModel<
    TARGET_PROMPT,
    ToolCallsGenerationModelSettings
  >,
> implements ToolCallsGenerationModel<SOURCE_PROMPT, MODEL["settings"]>
{
  private readonly model: MODEL;
  private readonly template: ToolCallsPromptTemplate<
    SOURCE_PROMPT,
    TARGET_PROMPT
  >;

  constructor({
    model,
    template,
  }: {
    model: MODEL;
    template: ToolCallsPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
  }) {
    this.model = model;
    this.template = template;
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

  async doGenerateToolCalls(
    tools: Array<ToolDefinition<string, unknown>>,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const {
      rawResponse,
      text: generatedText,
      metadata,
    } = await generateText({
      model: this.model,
      prompt: this.template.createPrompt(prompt, tools),
      fullResponse: true,
      ...options,
    });

    try {
      const { text, toolCalls } =
        this.template.extractToolCallsAndText(generatedText);

      return {
        rawResponse,
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
      throw new ToolCallsParseError({
        valueText: generatedText,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new TextGenerationToolCallsModel({
      model: this.model.withSettings(additionalSettings),
      template: this.template,
    }) as this;
  }
}
