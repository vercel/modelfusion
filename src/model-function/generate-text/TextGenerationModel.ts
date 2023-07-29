import {
  BasicTokenizer,
  FullTokenizer,
} from "../../model-function/tokenize-text/Tokenizer.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

// TODO replicate properties into streaming model (or abstract into common interface)
export interface TextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
> extends Model<SETTINGS> {
  readonly contextWindowSize: number | undefined;
  readonly tokenizer: BasicTokenizer | FullTokenizer | undefined;

  readonly countPromptTokens:
    | ((prompt: PROMPT) => PromiseLike<number>)
    | undefined;

  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractText(response: RESPONSE): string;

  /**
   * Sets the maximum number of tokens to generate.
   * Does nothing if the model does not support this setting.
   */
  withMaxTokens(maxTokens: number): this;
}
