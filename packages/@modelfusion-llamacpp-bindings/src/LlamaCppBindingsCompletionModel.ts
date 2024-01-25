import {
  TextGenerationBaseModel,
  TextGenerationModel,
  InstructionPrompt,
  ChatPrompt,
  BasicTokenizer,
  FullTokenizer,
  TextGenerationResult,
  LlamaCppCompletionModelSettings,
  LlamaCppCompletionPrompt,
} from "modelfusion";
import { AbstractModel } from "modelfusion/internal";

export class LlamaCppBindingsCompletionModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>>
  implements
    TextGenerationBaseModel<
      LlamaCppCompletionPrompt,
      LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(
    settings: LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
  ) {
    super({ settings });
  }
  withTextPrompt(): TextGenerationModel<
    string,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  withInstructionPrompt(): TextGenerationModel<
    InstructionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  withChatPrompt(): TextGenerationModel<
    ChatPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  withPromptTemplate<INPUT_PROMPT>(): TextGenerationModel<
    INPUT_PROMPT,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }
  contextWindowSize: number | undefined;
  tokenizer: BasicTokenizer | FullTokenizer | undefined;
  countPromptTokens:
    | ((prompt: LlamaCppCompletionPrompt) => PromiseLike<number>)
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
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    return {};
  }

  withSettings(): this {
    return this;
  }
}
