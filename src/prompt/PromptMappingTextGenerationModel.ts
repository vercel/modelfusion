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
  MODEL extends TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS>,
> implements TextGenerationModel<PROMPT, RESPONSE, SETTINGS>
{
  private readonly model: MODEL;
  private readonly promptMapping: PromptMapping<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptMapping,
  }: {
    model: MODEL;
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

  get tokenizer(): MODEL["tokenizer"] {
    return this.model.tokenizer;
  }

  get maxTokens(): MODEL["maxTokens"] {
    return this.model.maxTokens;
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
