import { FunctionOptions } from "../../core/FunctionOptions.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";
import { ImageGenerationPromptFormat } from "./ImageGenerationPromptFormat.js";

export class PromptFormatImageGenerationModel<
  PROMPT,
  MODEL_PROMPT,
  SETTINGS extends ImageGenerationModelSettings,
  MODEL extends ImageGenerationModel<MODEL_PROMPT, SETTINGS>,
> implements ImageGenerationModel<PROMPT, SETTINGS>
{
  readonly model: MODEL;
  readonly promptFormat: ImageGenerationPromptFormat<PROMPT, MODEL_PROMPT>;

  constructor({
    model,
    promptFormat,
  }: {
    model: MODEL;
    promptFormat: ImageGenerationPromptFormat<PROMPT, MODEL_PROMPT>;
  }) {
    this.model = model;
    this.promptFormat = promptFormat;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  doGenerateImage(
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    base64Image: string;
  }> {
    const mappedPrompt = this.promptFormat.format(prompt);
    return this.model.doGenerateImage(mappedPrompt, options);
  }

  get settingsForEvent(): Partial<SETTINGS> {
    return this.model.settingsForEvent;
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: ImageGenerationPromptFormat<INPUT_PROMPT, PROMPT>
  ): PromptFormatImageGenerationModel<INPUT_PROMPT, PROMPT, SETTINGS, this> {
    return new PromptFormatImageGenerationModel<
      INPUT_PROMPT,
      PROMPT,
      SETTINGS,
      this
    >({ model: this, promptFormat });
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new PromptFormatImageGenerationModel({
      model: this.model.withSettings(additionalSettings),
      promptFormat: this.promptFormat,
    }) as this;
  }
}
