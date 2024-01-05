import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { PromptTemplate } from "../PromptTemplate.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";

export class PromptTemplateImageGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  SETTINGS extends ImageGenerationModelSettings,
  MODEL extends ImageGenerationModel<MODEL_PROMPT, SETTINGS>,
> implements ImageGenerationModel<PROMPT, SETTINGS>
{
  readonly model: MODEL;
  readonly promptTemplate: PromptTemplate<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptTemplate,
  }: {
    model: MODEL;
    promptTemplate: PromptTemplate<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptTemplate = promptTemplate;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  doGenerateImages(prompt: PROMPT, options: FunctionCallOptions) {
    const mappedPrompt = this.promptTemplate.format(prompt);
    return this.model.doGenerateImages(mappedPrompt, options);
  }

  get settingsForEvent(): Partial<SETTINGS> {
    return this.model.settingsForEvent;
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<INPUT_PROMPT, PROMPT>
  ): PromptTemplateImageGenerationModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptTemplateImageGenerationModel<
      INPUT_PROMPT,
      PROMPT,
      SETTINGS,
      this
    >({ model: this, promptTemplate });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptTemplateImageGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptTemplate: this.promptTemplate,
    }) as this;
  }
}
