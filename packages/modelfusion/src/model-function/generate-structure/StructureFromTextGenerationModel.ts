import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../generate-text/TextGenerationModel.js";
import { generateText } from "../generate-text/generateText.js";
import { StructureFromTextPromptTemplate } from "./StructureFromTextPromptTemplate.js";
import { StructureGenerationModel } from "./StructureGenerationModel.js";
import { StructureParseError } from "./StructureParseError.js";

export class StructureFromTextGenerationModel<
  SOURCE_PROMPT,
  TARGET_PROMPT,
  MODEL extends TextGenerationModel<TARGET_PROMPT, TextGenerationModelSettings>,
> implements StructureGenerationModel<SOURCE_PROMPT, MODEL["settings"]>
{
  protected readonly model: MODEL;
  protected readonly template: StructureFromTextPromptTemplate<
    SOURCE_PROMPT,
    TARGET_PROMPT
  >;

  constructor({
    model,
    template,
  }: {
    model: MODEL;
    template: StructureFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT>;
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

  async doGenerateStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: SOURCE_PROMPT,
    options?: FunctionOptions
  ) {
    const { rawResponse: response, text } = await generateText(
      this.model,
      this.template.createPrompt(prompt, schema),
      {
        ...options,
        fullResponse: true,
      }
    );

    try {
      return {
        response,
        value: this.template.extractStructure(text),
        valueText: text,
      };
    } catch (error) {
      throw new StructureParseError({
        valueText: text,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new StructureFromTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      template: this.template,
    }) as this;
  }
}
