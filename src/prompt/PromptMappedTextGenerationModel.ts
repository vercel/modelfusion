import { FunctionOptions } from "../model-function/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../model-function/generate-text/TextGenerationModel.js";
import { PromptMapper } from "./PromptMapper.js";

export class PromptMappedTextGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
> implements TextGenerationModel<PROMPT, RESPONSE, SETTINGS>
{
  private readonly model: TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS>;
  private readonly promptMapper: PromptMapper<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptMapper,
  }: {
    model: TextGenerationModel<MODEL_PROMPT, RESPONSE, SETTINGS>;
    promptMapper: PromptMapper<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptMapper = promptMapper;
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
    const mappedPrompt = this.promptMapper.map(prompt);
    return this.model.generateTextResponse(mappedPrompt, options);
  }

  extractText(response: RESPONSE): string {
    return this.model.extractText(response);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptMappedTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptMapper: this.promptMapper,
    }) as this;
  }
}
