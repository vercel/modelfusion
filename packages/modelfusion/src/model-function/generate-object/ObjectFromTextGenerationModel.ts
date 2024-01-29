import { FunctionOptions } from "../../core/FunctionOptions";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../generate-text/TextGenerationModel";
import { generateText } from "../generate-text/generateText";
import { ObjectFromTextPromptTemplate } from "./ObjectFromTextPromptTemplate";
import { ObjectGenerationModel } from "./ObjectGenerationModel";
import { ObjectParseError } from "./ObjectParseError";

export class ObjectFromTextGenerationModel<
  SOURCE_PROMPT,
  TARGET_PROMPT,
  MODEL extends TextGenerationModel<TARGET_PROMPT, TextGenerationModelSettings>,
> implements ObjectGenerationModel<SOURCE_PROMPT, MODEL["settings"]>
{
  protected readonly model: MODEL;
  protected readonly template: ObjectFromTextPromptTemplate<
    SOURCE_PROMPT,
    TARGET_PROMPT
  >;

  constructor({
    model,
    template,
  }: {
    model: MODEL;
    template: ObjectFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
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

  async doGenerateObject(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { rawResponse, text } = await generateText({
      model: this.getModelWithJsonOutput(schema),
      prompt: this.template.createPrompt(prompt, schema),
      fullResponse: true,
      ...options,
    });

    try {
      return {
        rawResponse,
        value: this.template.extractObject(text),
        valueText: text,
      };
    } catch (error) {
      throw new ObjectParseError({
        valueText: text,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new ObjectFromTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      template: this.template,
    }) as this;
  }
}
