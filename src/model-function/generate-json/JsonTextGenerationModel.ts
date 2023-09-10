import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../generate-text/TextGenerationModel.js";
import { StructureDefinition } from "../generate-structure/StructureDefinition.js";
import { InstructionWithStructure } from "./InstructionWithStructurePrompt.js";
import { StructureGenerationModel } from "../generate-structure/StructureGenerationModel.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { generateText } from "../generate-text/generateText.js";

export type JsonTextPromptFormat = {
  createPrompt: (prompt: {
    instruction: string;
    structure: StructureDefinition<string, unknown>;
  }) => string;
  extractJson: (response: string) => unknown;
};

export class JsonTextGenerationModel<
  MODEL extends TextGenerationModel<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    TextGenerationModelSettings
  >,
> implements
    StructureGenerationModel<
      InstructionWithStructure<string, unknown>,
      string,
      MODEL["settings"]
    >
{
  private readonly model: MODEL;
  private readonly format: JsonTextPromptFormat;

  constructor({
    model,
    format,
  }: {
    model: MODEL;
    format: JsonTextPromptFormat;
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
    prompt: InstructionWithStructure<string, unknown>,
    options?: ModelFunctionOptions<MODEL["settings"]> | undefined
  ): Promise<string> {
    return await generateText(
      this.model,
      this.format.createPrompt(prompt),
      options
    );
  }

  extractStructure(response: string): unknown {
    return this.format.extractJson(response);
  }

  withSettings(additionalSettings: Partial<MODEL["settings"]>): this {
    return new JsonTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}
