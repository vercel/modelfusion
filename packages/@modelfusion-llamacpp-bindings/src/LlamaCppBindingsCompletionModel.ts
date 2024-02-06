import {
  LlamaCppCompletionModelSettings,
  LlamaCppCompletionPrompt,
  FunctionCallOptions,
  LlamaCppTokenizer,
  TextStreamingBaseModel,
  BasicTokenizer,
  ChatPrompt,
  Delta,
  FullTokenizer,
  InstructionPrompt,
  JsonSchemaProducer,
  Schema,
  TextGenerationPromptTemplate,
  TextGenerationResult,
  TextStreamingModel,
  FlexibleObjectFromTextPromptTemplate,
  ObjectFromTextPromptTemplate,
  ObjectFromTextStreamingModel,
  PromptTemplateTextStreamingModel,
  TextGenerationPromptTemplateProvider,
  textGenerationModelProperties,
} from "modelfusion";

import { Text } from "./base/LlamaCppPrompt";
import { convertJsonSchemaToGBNF } from "./base/convertJsonSchemaToGBNF";
import { AbstractModel } from "./base/AbstractModel";
import { LlamaCppBindings } from "./binding";

export class LlamaCppBindingsCompletionModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>>
  implements
    TextStreamingBaseModel<
      LlamaCppCompletionPrompt,
      LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(
    settings: LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
  ) {
    super({ settings });
    this.tokenizer = new LlamaCppTokenizer(this.settings.api);
  }

  readonly provider = "llamacppbindgins";
  contextWindowSize: number | undefined;
  tokenizer: BasicTokenizer | FullTokenizer | undefined;

  get modelName() {
    return null;
  }

  get settingsForEvent(): Partial<
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,
      "contextWindowSize",
      "temperature",
      "topK",
      "topP",
      "minP",
      "nKeep",
      "tfsZ",
      "typicalP",
      "repeatPenalty",
      "repeatLastN",
      "penalizeNl",
      "presencePenalty",
      "frequencyPenalty",
      "penaltyPrompt",
      "mirostat",
      "mirostatTau",
      "mirostatEta",
      "grammar",
      "seed",
      "ignoreEos",
      "logitBias",
      "nProbs",
      "cachePrompt",
      "slotId",
    ] satisfies (keyof LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  private get promptTemplateProvider(): TextGenerationPromptTemplateProvider<LlamaCppCompletionPrompt> {
    return this.settings.promptTemplate ?? Text;
  }

  withTextPrompt(): TextStreamingModel<
    string,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    throw new Error("Method not implemented.");
  }

  withInstructionPrompt(): TextStreamingModel<
    InstructionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.instruction());
  }

  withChatPrompt(): PromptTemplateTextStreamingModel<
    ChatPrompt,
    LlamaCppCompletionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.chat());
  }

  /**
   * Maps the prompt for the full Llama.cpp prompt template (incl. image support).
   */
  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      LlamaCppCompletionPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    LlamaCppCompletionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return new PromptTemplateTextStreamingModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      }),
      promptTemplate,
    });
  }

  withSettings(
    additionalSettings: Partial<
      LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
  ) {
    return new LlamaCppBindingsCompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  doStreamText(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prompt: LlamaCppCompletionPrompt,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: FunctionCallOptions | undefined
  ): PromiseLike<AsyncIterable<Delta<unknown>>> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extractTextDelta(delta: unknown): string | undefined {
    throw new Error("Method not implemented.");
  }

  countPromptTokens:
    | ((prompt: LlamaCppCompletionPrompt) => PromiseLike<number>)
    | undefined;

  async doGenerateTexts(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prompt: LlamaCppCompletionPrompt,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: FunctionCallOptions | undefined
  ): Promise<{
    rawResponse: unknown;
    textGenerationResults: TextGenerationResult[];
    usage?:
      | { promptTokens: number; completionTokens: number; totalTokens: number }
      | undefined;
  }> {
    const info = await LlamaCppBindings.getSystemInfo();
    console.log(info);
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  restoreGeneratedTexts(rawResponse: unknown): {
    rawResponse: unknown;
    textGenerationResults: TextGenerationResult[];
    usage?:
      | { promptTokens: number; completionTokens: number; totalTokens: number }
      | undefined;
  } {
    throw new Error("Method not implemented.");
  }

  asObjectGenerationModel<INPUT_PROMPT, LlamaCppPrompt>(
    promptTemplate:
      | ObjectFromTextPromptTemplate<INPUT_PROMPT, LlamaCppPrompt>
      | FlexibleObjectFromTextPromptTemplate<INPUT_PROMPT, unknown>
  ) {
    return "adaptModel" in promptTemplate
      ? new ObjectFromTextStreamingModel({
          model: promptTemplate.adaptModel(this),
          template: promptTemplate,
        })
      : new ObjectFromTextStreamingModel({
          model: this as TextStreamingModel<LlamaCppPrompt>,
          template: promptTemplate,
        });
  }

  withJsonOutput(schema: Schema<unknown> & JsonSchemaProducer): this {
    // don't override the grammar if it's already set (to allow user to override)
    if (this.settings.grammar != null) {
      return this;
    }

    const grammar = convertJsonSchemaToGBNF(schema.getJsonSchema());

    return this.withSettings({
      grammar: grammar,
    });
  }
}
