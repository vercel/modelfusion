import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Delta } from "../Delta.js";
import { Model, ModelSettings } from "../Model.js";
import { BasicTokenizer, FullTokenizer } from "../tokenize-text/Tokenizer.js";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate.js";

export interface TextGenerationModelSettings extends ModelSettings {
  /**
   * Maximum number of tokens to generate.
   * Does nothing if the model does not support this setting.
   */
  maxCompletionTokens?: number | undefined;

  /**
   * Stop sequences to use. Stop sequences are not included in the generated text.
   * Does nothing if the model does not support this setting.
   */
  stopSequences?: string[] | undefined;

  /**
   * When true, the leading and trailing white space and line terminator characters
   * are removed from the generated text.
   */
  trimWhitespace?: boolean;
}

export interface HasContextWindowSize {
  contextWindowSize: number;
}

export interface HasTokenizer<PROMPT> {
  tokenizer: BasicTokenizer | FullTokenizer;

  countPromptTokens(prompt: PROMPT): PromiseLike<number>;
}

export interface TextGenerationModel<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings = TextGenerationModelSettings,
> extends Model<SETTINGS> {
  readonly contextWindowSize: number | undefined;

  readonly tokenizer: BasicTokenizer | FullTokenizer | undefined;

  /**
   * Optional. Implement if you have a tokenizer and want to count the number of tokens in a prompt.
   */
  readonly countPromptTokens:
    | ((prompt: PROMPT) => PromiseLike<number>)
    | undefined;

  doGenerateText(
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): TextGenerationModel<INPUT_PROMPT, SETTINGS>;
}

export interface TextStreamingModel<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings = TextGenerationModelSettings,
> extends TextGenerationModel<PROMPT, SETTINGS> {
  doStreamText(
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<AsyncIterable<Delta<string>>>;

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): TextStreamingModel<INPUT_PROMPT, SETTINGS>;
}
