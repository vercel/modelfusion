import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { PromptTemplate } from "../PromptTemplate.js";

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

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<INPUT_PROMPT, PROMPT>
  ): ImageGenerationModel<INPUT_PROMPT, SETTINGS>;
}
