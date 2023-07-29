import { FunctionOptions } from "../FunctionOptions.js";
import { ModelSettings } from "../Model.js";
import { TextPromptModel } from "../TextPromptModel.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

export interface TextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
> extends TextPromptModel<PROMPT, SETTINGS> {
  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractText(response: RESPONSE): string;
}
