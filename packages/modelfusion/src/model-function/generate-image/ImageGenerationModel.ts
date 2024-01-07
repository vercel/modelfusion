import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { PromptTemplate } from "../PromptTemplate.js";

export interface ImageGenerationModelSettings extends ModelSettings {
  /**
   * Number of images to generate.
   *
   * Specifies the number of images the model should generate for a given prompt.
   *
   * Does nothing if the model does not support this setting.
   *
   * Example: `numberOfGenerations: 2` // The model will produce 2 images
   */
  numberOfGenerations?: number;
}

export interface ImageGenerationModel<
  PROMPT,
  SETTINGS extends ImageGenerationModelSettings = ImageGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateImages(
    prompt: PROMPT,
    options: FunctionCallOptions
  ): PromiseLike<{
    rawResponse: unknown;
    base64Images: string[];
  }>;

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<INPUT_PROMPT, PROMPT>
  ): ImageGenerationModel<INPUT_PROMPT, SETTINGS>;
}
