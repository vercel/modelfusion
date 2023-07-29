import { FunctionOptions } from "../model-function/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../model-function/generate-text/TextGenerationModel.js";
import { PromptMapping } from "./PromptMapping.js";

export class PromptMappingTextGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
> implements TextGenerationModel<PROMPT, RESPONSE, SETTINGS>
{
  private readonly model: TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS>;
  private readonly promptMapping: PromptMapping<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptMapping,
  }: {
    model: TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS>;
    promptMapping: PromptMapping<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptMapping = promptMapping;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE> {
    const mappedPrompt = this.promptMapping.map(prompt);
    return this.model.generateTextResponse(mappedPrompt, options);
  }

  extractText(response: RESPONSE): string {
    return this.model.extractText(response);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptMappingTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptMapping: this.promptMapping,
    }) as this;
  }
}
