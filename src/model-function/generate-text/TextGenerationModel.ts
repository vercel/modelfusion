import { BasicTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

export interface TextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings
> extends Model<SETTINGS> {
  generateTextResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractText(response: RESPONSE): string;
}

export interface TextGenerationModelWithTokenization<
  PROMPT,
  RESPONSE,
  SETTINGS extends TextGenerationModelSettings
> extends TextGenerationModel<PROMPT, RESPONSE, SETTINGS>,
    BasicTokenizer {
  readonly maxTokens: number;
  countPromptTokens(prompt: PROMPT): PromiseLike<number>;
  withMaxTokens(
    maxTokens: number
  ): TextGenerationModelWithTokenization<PROMPT, RESPONSE, SETTINGS>;
}
