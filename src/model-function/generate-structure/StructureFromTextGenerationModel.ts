import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../generate-text/TextGenerationModel.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { StructureGenerationModel } from "./StructureGenerationModel.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { generateText } from "../generate-text/generateText.js";

export type StructureFromTextPromptFormat<PROMPT> = {
  createPrompt: (
    prompt: PROMPT,
    structure: StructureDefinition<string, unknown>
  ) => string;
  extractStructure: (response: string) => unknown;
};

export class StructureFromTextGenerationModel<
  PROMPT,
  MODEL extends TextGenerationModel<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    TextGenerationModelSettings
  >,
> implements
    StructureGenerationModel<PROMPT, string, undefined, MODEL["settings"]>
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

  async generateStructureResponse(
    structure: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: ModelFunctionOptions<MODEL["settings"]> | undefined
  ): Promise<string> {
    return await generateText(
      this.model,
      this.format.createPrompt(prompt, structure),
      options
    );
  }

  extractStructure(response: string): unknown {
    return this.format.extractStructure(response);
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new StructureFromTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}
