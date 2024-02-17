import {
  getOpenAICompletionModelInformation,
  OpenAICompletionModelType,
} from "@modelfusion/types";
import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel";
import {
  TextStreamingBaseModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate";
import {
  chat,
  instruction,
  text,
} from "../../model-function/generate-text/prompt-template/TextPromptTemplate";
import { countTokens } from "../../model-function/tokenize-text/countTokens";
import {
  AbstractOpenAICompletionModel,
  AbstractOpenAICompletionModelSettings,
} from "./AbstractOpenAICompletionModel";
import { TikTokenTokenizer } from "./TikTokenTokenizer";

export interface OpenAICompletionModelSettings
  extends AbstractOpenAICompletionModelSettings {
  model: OpenAICompletionModelType;
}

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAICompletionModel({
 *   model: "gpt-3.5-turbo-instruct",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class OpenAICompletionModel
  extends AbstractOpenAICompletionModel<OpenAICompletionModelSettings>
  implements TextStreamingBaseModel<string, OpenAICompletionModelSettings>
{
  constructor(settings: OpenAICompletionModelSettings) {
    super(settings);

    const modelInformation = getOpenAICompletionModelInformation(
      this.settings.model
    );

    this.tokenizer = new TikTokenTokenizer({
      model: this.settings.model,
    });
    this.contextWindowSize = modelInformation.contextWindowSize;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: TikTokenTokenizer;

  async countPromptTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  get settingsForEvent(): Partial<OpenAICompletionModelSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "suffix",
      "temperature",
      "topP",
      "logprobs",
      "echo",
      "presencePenalty",
      "frequencyPenalty",
      "bestOf",
      "logitBias",
      "seed",
    ] satisfies (keyof OpenAICompletionModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  withTextPrompt() {
    return this.withPromptTemplate(text());
  }

  withInstructionPrompt() {
    return this.withPromptTemplate(instruction());
  }

  withChatPrompt(options?: { user?: string; assistant?: string }) {
    return this.withPromptTemplate(chat(options));
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    string,
    OpenAICompletionModelSettings,
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

  withSettings(additionalSettings: Partial<OpenAICompletionModelSettings>) {
    return new OpenAICompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
