import { FunctionOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../generate-text/TextGenerationModel.js";
import { generateText } from "../generate-text/generateText.js";
import { StructureGenerationModel } from "./StructureGenerationModel.js";
import { StructureParseError } from "./StructureParseError.js";

export type StructureFromTextPromptFormat<PROMPT> = {
  createPrompt: (
    prompt: PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => string;
  extractStructure: (response: string) => unknown;
};

export class StructureFromTextGenerationModel<
  PROMPT,
  MODEL extends TextGenerationModel<string, TextGenerationModelSettings>,
> implements StructureGenerationModel<PROMPT, MODEL["settings"]>
{
  protected readonly model: MODEL;
  protected readonly format: StructureFromTextPromptFormat<PROMPT>;

  constructor({
    model,
    format,
  }: {
    model: MODEL;
    format: StructureFromTextPromptFormat<PROMPT>;
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

  async doGenerateStructure(
    schema: Schema<unknown> & JsonSchemaProducer,
    prompt: PROMPT,
    options?: FunctionOptions
  ) {
    const { response, value } = await generateText(
      this.model,
      this.format.createPrompt(prompt, schema),
      {
        ...options,
        returnType: "full",
      }
    );

    try {
      return {
        response,
        value: this.format.extractStructure(value),
        valueText: value,
      };
    } catch (error) {
      throw new StructureParseError({
        valueText: value,
        cause: error,
      });
    }
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new StructureFromTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}
