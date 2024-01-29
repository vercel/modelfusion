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
import {
  AbstractOpenAICompletionModel,
  AbstractOpenAICompletionModelSettings,
} from "../openai/AbstractOpenAICompletionModel";
import {
  OpenAICompatibleApiConfiguration,
  OpenAICompatibleProviderName,
} from "./OpenAICompatibleApiConfiguration";

export interface OpenAICompatibleCompletionModelSettings
  extends AbstractOpenAICompletionModelSettings {
  api: OpenAICompatibleApiConfiguration; // required
  provider?: OpenAICompatibleProviderName;
}

/**
 * Create a text generation model that calls an API that is compatible with OpenAI's completion API.
 *
 * Please note that many providers implement the API with slight differences, which can cause
 * unexpected errors and different behavior in less common scenarios.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 */
export class OpenAICompatibleCompletionModel
  extends AbstractOpenAICompletionModel<OpenAICompatibleCompletionModelSettings>
  implements
    TextStreamingBaseModel<string, OpenAICompatibleCompletionModelSettings>
{
  constructor(settings: OpenAICompatibleCompletionModelSettings) {
    super(settings);
  }

  get provider(): OpenAICompatibleProviderName {
    return (
      this.settings.provider ?? this.settings.api.provider ?? "openaicompatible"
    );
  }

  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  get settingsForEvent(): Partial<OpenAICompatibleCompletionModelSettings> {
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
    ] satisfies (keyof OpenAICompatibleCompletionModelSettings)[];

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
    OpenAICompatibleCompletionModelSettings,
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
    additionalSettings: Partial<OpenAICompatibleCompletionModelSettings>
  ) {
    return new OpenAICompatibleCompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
