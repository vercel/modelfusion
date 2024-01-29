import { FunctionOptions } from "../../core/FunctionOptions";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel";
import { generateText } from "../../model-function/generate-text/generateText";
import { ToolDefinition } from "../ToolDefinition";
import { ToolCallGenerationModel } from "./ToolCallGenerationModel";
import { ToolCallParseError } from "./ToolCallParseError";
import { ToolCallPromptTemplate } from "./ToolCallPromptTemplate";

export class TextGenerationToolCallModel<
  SOURCE_PROMPT,
  TARGET_PROMPT,
  MODEL extends TextGenerationModel<TARGET_PROMPT, TextGenerationModelSettings>,
> implements ToolCallGenerationModel<SOURCE_PROMPT, MODEL["settings"]>
{
  private readonly model: MODEL;
  private readonly template: ToolCallPromptTemplate<
    SOURCE_PROMPT,
    TARGET_PROMPT
  >;

  constructor({
    model,
    template,
  }: {
    model: MODEL;
    template: ToolCallPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
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

  getModelWithJsonOutput(schema: Schema<unknown> & JsonSchemaProducer) {
    if (this.template.withJsonOutput != null) {
      return this.template.withJsonOutput({
        model: this.model,
        schema,
      }) as MODEL;
    }

    return this.model;
  }

  async doGenerateToolCall(
    tool: ToolDefinition<string, unknown>,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { rawResponse, text, metadata } = await generateText({
      model: this.getModelWithJsonOutput(tool.parameters),
      prompt: this.template.createPrompt(prompt, tool),
      fullResponse: true,
      ...options,
    });

    try {
      return {
        rawResponse,
        toolCall: this.template.extractToolCall(text, tool),
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
      template: this.template,
    }) as this;
  }
}
