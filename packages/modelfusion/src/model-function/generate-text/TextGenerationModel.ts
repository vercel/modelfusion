import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../Delta.js";
import { Model, ModelSettings } from "../Model.js";
import { BasicTokenizer, FullTokenizer } from "../tokenize-text/Tokenizer.js";
import { TextGenerationPromptTemplate } from "./TextGenerationPromptTemplate.js";
import { TextGenerationResult } from "./TextGenerationResult.js";

export const textGenerationModelProperties = [
  "maxGenerationTokens",
  "stopSequences",
  "numberOfGenerations",
  "trimWhitespace",
] as const;

export interface TextGenerationModelSettings extends ModelSettings {
  /**
   * Specifies the maximum number of tokens (words, punctuation, parts of words) that the model can generate in a single response.
   * It helps to control the length of the output.
   *
   * Does nothing if the model does not support this setting.
   *
   * Example: `maxGenerationTokens: 1000`
   */
  maxGenerationTokens?: number | undefined;

  /**
   * Stop sequences to use.
   * Stop sequences are an array of strings or a single string that the model will recognize as end-of-text indicators.
   * The model stops generating more content when it encounters any of these strings.
   * This is particularly useful in scripted or formatted text generation, where a specific end point is required.
   * Stop sequences not included in the generated text.
   *
   * Does nothing if the model does not support this setting.
   *
   * Example: `stopSequences: ['\n', 'END']`
   */
  stopSequences?: string[] | undefined;

  /**
   * Number of texts to generate.
   *
   * Specifies the number of responses or completions the model should generate for a given prompt.
   * This is useful when you need multiple different outputs or ideas for a single prompt.
   * The model will generate 'n' distinct responses, each based on the same initial prompt.
   * In a streaming model this will result in both responses streamed back in real time.
   *
   * Does nothing if the model does not support this setting.
   *
   * Example: `numberOfGenerations: 3` // The model will produce 3 different responses.
   */
  numberOfGenerations?: number;

  /**
   * When true, the leading and trailing white space and line terminator characters
   * are removed from the generated text.
   *
   * Default: true.
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

  doGenerateTexts(
    prompt: PROMPT,
    options?: FunctionCallOptions
  ): PromiseLike<{
    rawResponse: unknown;
    textGenerationResults: TextGenerationResult[];
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;

  restoreGeneratedTexts(rawResponse: unknown): {
    rawResponse: unknown;
    textGenerationResults: TextGenerationResult[];
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): TextGenerationModel<INPUT_PROMPT, SETTINGS>;

  /**
   * When possible, limit the output generation to the specified JSON schema,
   * or super sets of it (e.g. JSON in general).
   */
  withJsonOutput(schema: Schema<unknown> & JsonSchemaProducer): this;
}

export interface TextStreamingModel<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings = TextGenerationModelSettings,
> extends TextGenerationModel<PROMPT, SETTINGS> {
  doStreamText(
    prompt: PROMPT,
    options?: FunctionCallOptions
  ): PromiseLike<AsyncIterable<Delta<unknown>>>;

  extractTextDelta(delta: unknown): string | undefined;

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, PROMPT>
  ): TextStreamingModel<INPUT_PROMPT, SETTINGS>;
}
