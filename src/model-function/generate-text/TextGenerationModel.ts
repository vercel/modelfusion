import { PromptFormat } from "../../prompt/PromptFormat.js";
import { PromptFormatTextGenerationModel } from "../../prompt/PromptFormatTextGenerationModel.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
import { BasicTokenizer, FullTokenizer } from "../tokenize-text/Tokenizer.js";
import { DeltaEvent } from "./DeltaEvent.js";

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

export interface TextGenerationModel<
  PROMPT,
  RESPONSE,
  FULL_DELTA,
  SETTINGS extends TextGenerationModelSettings,
> extends Model<SETTINGS> {
  readonly contextWindowSize: number | undefined;

  readonly tokenizer: BasicTokenizer | FullTokenizer | undefined;

  /**
   * Optional. Implement if you have a tokenizer and want to count the number of tokens in a prompt.
   */
  readonly countPromptTokens:
    | ((prompt: PROMPT) => PromiseLike<number>)
    | undefined;

  generateTextResponse(
    prompt: PROMPT,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractText(response: RESPONSE): string;

  /**
   * Optional. Implement for streaming support.
   */
  readonly generateDeltaStreamResponse:
    | ((
        prompt: PROMPT,
        options: ModelFunctionOptions<SETTINGS>
      ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>)
    | undefined;

  /**
   * Optional. Implement for streaming support.
   */
  readonly extractTextDelta:
    | ((fullDelta: FULL_DELTA) => string | undefined)
    | undefined;

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, PROMPT>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    PROMPT,
    RESPONSE,
    FULL_DELTA,
    SETTINGS,
    this
  >;
}
