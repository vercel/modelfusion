import {
  TextGenerationBaseModel,
  TextGenerationModel,
  TextGenerationModelSettings,
  TextGenerationPromptTemplateProvider,
  InstructionPrompt,
  ChatPrompt,
  BasicTokenizer,
  FullTokenizer,
  TextGenerationResult,
} from "modelfusion";
import { AbstractModel } from "modelfusion/model-function/AbstractModel";

export interface LlamaCppBindingsCompletionPrompt {
  /**
   * Text prompt. Images can be included through references such as `[img-ID]`, e.g. `[img-1]`.
   */
  text: string;

  /**
   * Maps image id to image base data.
   */
  images?: Record<number, string>;
}

export interface LlamaCppBindingsCompletionModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends TextGenerationModelSettings {
  /**
   * Specify the context window size of the model that you have loaded in your
   * Llama.cpp server.
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  /**
   * Adjust the randomness of the generated text (default: 0.8).
   */
  temperature?: number;

  /**
   * Limit the next token selection to the K most probable tokens (default: 40).
   */
  topK?: number;

  /**
   * Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P (default: 0.95).
   */
  topP?: number;

  /**
   * The minimum probability for a token to be considered, relative to the probability of the most likely token (default: 0.05).
   */
  minP?: number;

  /**
   * Specify the number of tokens from the prompt to retain when the context size is exceeded
   * and tokens need to be discarded. By default, this value is set to 0 (meaning no tokens
   * are kept). Use -1 to retain all tokens from the prompt.
   */
  nKeep?: number;

  /**
   * Enable tail free sampling with parameter z (default: 1.0, 1.0 = disabled).
   */
  tfsZ?: number;

  /**
   * Enable locally typical sampling with parameter p (default: 1.0, 1.0 = disabled).
   */
  typicalP?: number;

  /**
   * Control the repetition of token sequences in the generated text (default: 1.1).
   */
  repeatPenalty?: number;

  /**
   * Last n tokens to consider for penalizing repetition (default: 64, 0 = disabled, -1 = ctx-size).
   */
  repeatLastN?: number;

  /**
   * Penalize newline tokens when applying the repeat penalty (default: true).
   */
  penalizeNl?: boolean;

  /**
   * Repeat alpha presence penalty (default: 0.0, 0.0 = disabled).
   */
  presencePenalty?: number;

  /**
   * Repeat alpha frequency penalty (default: 0.0, 0.0 = disabled).
   */
  frequencyPenalty?: number;

  /**
   * This will replace the prompt for the purpose of the penalty evaluation.
   * Can be either null, a string or an array of numbers representing tokens
   * (default: null = use the original prompt).
   */
  penaltyPrompt?: string | number[];

  /**
   * Enable Mirostat sampling, controlling perplexity during text generation
   * (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0).
   */
  mirostat?: number;

  /**
   * Set the Mirostat target entropy, parameter tau (default: 5.0).
   */
  mirostatTau?: number;

  /**
   * Set the Mirostat learning rate, parameter eta (default: 0.1).
   */
  mirostatEta?: number;

  /**
   * Set grammar for grammar-based sampling (default: no grammar)
   *
   * @see https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md
   */
  grammar?: string;

  /**
   * Set the random number generator (RNG) seed
   * (default: -1, -1 = random seed).
   */
  seed?: number;

  /**
   * Ignore end of stream token and continue generating (default: false).
   */
  ignoreEos?: boolean;

  /**
   * Modify the likelihood of a token appearing in the generated text completion.
   * For example, use "logit_bias": [[15043,1.0]] to increase the likelihood of the token
   * 'Hello', or "logit_bias": [[15043,-1.0]] to decrease its likelihood.
   * Setting the value to false, "logit_bias": [[15043,false]] ensures that the token Hello is
   * never produced (default: []).
   */
  logitBias?: Array<[number, number | false]>;

  /**
   * If greater than 0, the response also contains the probabilities of top N tokens
   * for each generated token (default: 0)
   */
  nProbs?: number;

  /**
   * Save the prompt and generation for avoid reprocess entire prompt if a part of this isn't change (default: false)
   */
  cachePrompt?: boolean;

  /**
   * Assign the completion task to an specific slot.
   * If is -1 the task will be assigned to a Idle slot (default: -1)
   */
  slotId?: number;

  /**
   * Prompt template provider that is used when calling `.withTextPrompt()`, `withInstructionPrompt()` or `withChatPrompt()`.
   */
  promptTemplate?: TextGenerationPromptTemplateProvider<LlamaCppBindingsCompletionPrompt>;
}

export class LlamaCppBindingsCompletionModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<
    LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  >
  implements
    TextGenerationBaseModel<
      LlamaCppBindingsCompletionPrompt,
      LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(
    settings: LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
  ) {
    super({ settings });
  }
  withTextPrompt(): TextGenerationModel<
    string,
    LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  withInstructionPrompt(): TextGenerationModel<
    InstructionPrompt,
    LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  withChatPrompt(): TextGenerationModel<
    ChatPrompt,
    LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  withPromptTemplate<INPUT_PROMPT>(): TextGenerationModel<
    INPUT_PROMPT,
    LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  contextWindowSize: number | undefined;
  tokenizer: BasicTokenizer | FullTokenizer | undefined;
  countPromptTokens:
    | ((prompt: LlamaCppBindingsCompletionPrompt) => PromiseLike<number>)
    | undefined;
  doGenerateTexts(): PromiseLike<{
    rawResponse: unknown;
    textGenerationResults: TextGenerationResult[];
    usage?:
      | { promptTokens: number; completionTokens: number; totalTokens: number }
      | undefined;
  }> {
    throw new Error("Method not implemented.");
  }
  restoreGeneratedTexts(): {
    rawResponse: unknown;
    textGenerationResults: TextGenerationResult[];
    usage?:
      | { promptTokens: number; completionTokens: number; totalTokens: number }
      | undefined;
  } {
    throw new Error("Method not implemented.");
  }
  withJsonOutput(): this {
    throw new Error("Method not implemented.");
  }

  readonly provider = "llamacpp";

  get modelName() {
    return null;
  }

  get settingsForEvent(): Partial<
    LlamaCppBindingsCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    return {};
  }

  withSettings(): this {
    return this;
  }
}
