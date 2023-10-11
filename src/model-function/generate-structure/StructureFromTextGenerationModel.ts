import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
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
    structure: StructureDefinition<string, unknown>
  ) => string;
  extractStructure: (response: string) => unknown;
};

export class StructureFromTextGenerationModel<
  PROMPT,
  MODEL extends TextGenerationModel<string, TextGenerationModelSettings>,
> implements StructureGenerationModel<PROMPT, MODEL["settings"]>
{
  private readonly model: MODEL;
  private readonly format: StructureFromTextPromptFormat<PROMPT>;

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
    structure: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ) {
    const { response, value } = await generateText(
      this.model,
      this.format.createPrompt(prompt, structure),
      options
    ).asFullResponse();

    try {
      return {
        response,
        value: this.format.extractStructure(value),
        valueText: value,
      };
    } catch (error) {
      throw new StructureParseError({
        structureName: structure.name,
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
