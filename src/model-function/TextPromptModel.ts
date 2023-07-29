import { BasicTokenizer, FullTokenizer } from "./tokenize-text/Tokenizer.js";
import { Model } from "./Model.js";

export interface TextPromptModel<PROMPT, SETTINGS> extends Model<SETTINGS> {
  readonly contextWindowSize: number | undefined;
  readonly tokenizer: BasicTokenizer | FullTokenizer | undefined;

  readonly countPromptTokens:
    | ((prompt: PROMPT) => PromiseLike<number>)
    | undefined;

  /**
   * Sets the maximum number of tokens to generate.
   * Does nothing if the model does not support this setting.
   */
  withMaxTokens(maxTokens: number): this;
}
