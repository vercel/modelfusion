import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import {
  AbstractOpenAICompletionModel,
  AbstractOpenAICompletionModelSettings,
} from "../openai/AbstractOpenAICompletionModel.js";
import { OpenAICompatibleProviderName } from "./OpenAICompatibleProviderName.js";

export interface OpenAICompatibleCompletionModelSettings
  extends AbstractOpenAICompletionModelSettings {
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
    TextStreamingModel<string, OpenAICompatibleCompletionModelSettings>
{
  constructor(settings: OpenAICompatibleCompletionModelSettings) {
    super(settings);
  }

  get provider(): OpenAICompatibleProviderName {
    return this.settings.provider ?? "openaicompatible";
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
