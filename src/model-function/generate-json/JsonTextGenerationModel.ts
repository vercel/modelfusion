import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../generate-text/TextGenerationModel.js";
import { SchemaDefinition } from "./SchemaDefinition.js";
import { InstructionWithSchema } from "./InstructionWithSchemaPrompt.js";
import { GenerateJsonModel } from "./GenerateJsonModel.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { generateText } from "../generate-text/generateText.js";

export type JsonTextPromptFormat = {
  createPrompt: (prompt: {
    instruction: string;
    schemaDefinition: SchemaDefinition<string, unknown>;
  }) => string;
  extractJson: (response: string) => unknown;
};

export class JsonTextGenerationModel<
  SETTINGS extends TextGenerationModelSettings,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MODEL extends TextGenerationModel<string, any, any, SETTINGS>,
> implements
    GenerateJsonModel<InstructionWithSchema<string, unknown>, string, SETTINGS>
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

  async generateJsonResponse(
    prompt: InstructionWithSchema<string, unknown>,
    options?: ModelFunctionOptions<SETTINGS> | undefined
  ): Promise<string> {
    return await generateText(
      this.model,
      this.format.createPrompt(prompt),
      options
    );
  }

  extractJson(response: string): unknown {
    return this.format.extractJson(response);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new JsonTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}
