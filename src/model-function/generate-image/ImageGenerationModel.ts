import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface ImageGenerationModelSettings extends ModelSettings {}

export interface ImageGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends ImageGenerationModelSettings,
> extends Model<SETTINGS> {
  generateImageResponse(
    prompt: PROMPT,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractBase64Image(response: RESPONSE): string;
}
