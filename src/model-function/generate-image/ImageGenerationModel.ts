import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { ImageGenerationPromptFormat } from "./ImageGenerationPromptFormat.js";

export interface ImageGenerationModelSettings extends ModelSettings {}

export interface ImageGenerationModel<
  PROMPT,
  SETTINGS extends ImageGenerationModelSettings = ImageGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateImage(
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    base64Image: string;
  }>;

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: ImageGenerationPromptFormat<INPUT_PROMPT, PROMPT>
  ): ImageGenerationModel<INPUT_PROMPT, SETTINGS>;
}
