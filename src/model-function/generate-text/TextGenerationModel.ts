import {
  BasicTokenizer,
  FullTokenizer,
} from "../../model-function/tokenize-text/Tokenizer.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

export interface TextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
> extends Model<SETTINGS> {
  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractText(response: RESPONSE): string;

  readonly tokenizer: BasicTokenizer | FullTokenizer | undefined;
  readonly maxTokens: number | undefined;
}

// TODO separate interface instead of extending (to enable combination with streaming)
export interface TextGenerationModelWithTokenization<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings,
> extends TextGenerationModel<PROMPT, RESPONSE, SETTINGS> {
  countPromptTokens(prompt: PROMPT): PromiseLike<number>;
  withMaxTokens(
    maxTokens: number
  ): TextGenerationModelWithTokenization<PROMPT, RESPONSE, SETTINGS>;
}
