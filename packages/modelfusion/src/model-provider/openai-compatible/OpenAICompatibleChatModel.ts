import { StructureFromTextPromptTemplate } from "../../model-function/generate-structure/StructureFromTextPromptTemplate.js";
import { StructureFromTextStreamingModel } from "../../model-function/generate-structure/StructureFromTextStreamingModel.js";
import { PromptTemplateFullTextModel } from "../../model-function/generate-text/PromptTemplateFullTextModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ToolCallGenerationModel } from "../../tool/generate-tool-call/ToolCallGenerationModel.js";
import { ToolCallsOrTextGenerationModel } from "../../tool/generate-tool-calls-or-text/ToolCallsOrTextGenerationModel.js";
import {
  AbstractOpenAIChatCallSettings,
  AbstractOpenAIChatModel,
  OpenAIChatPrompt,
} from "../openai/AbstractOpenAIChatModel.js";
import { chat, instruction, text } from "../openai/OpenAIChatPromptTemplate.js";

export type OpenAICompatibleProviderName =
  | `openaicompatible`
  | `openaicompatible-${string}`;

export interface OpenAICompatibleChatSettings
  extends TextGenerationModelSettings,
    Omit<AbstractOpenAIChatCallSettings, "stop" | "maxTokens"> {
  provider?: OpenAICompatibleProviderName;
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls an API that is compatible with OpenAI's chat API.
 *
 * Please note that many providers implement the API with slight differences, which can cause
 * unexpected errors and different behavior in less common scenarios.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 */
export class OpenAICompatibleChatModel
  extends AbstractOpenAIChatModel<OpenAICompatibleChatSettings>
  implements
    TextStreamingModel<OpenAIChatPrompt, OpenAICompatibleChatSettings>,
    ToolCallGenerationModel<OpenAIChatPrompt, OpenAICompatibleChatSettings>,
    ToolCallsOrTextGenerationModel<
      OpenAIChatPrompt,
      OpenAICompatibleChatSettings
    >
{
  constructor(settings: OpenAICompatibleChatSettings) {
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

  get settingsForEvent(): Partial<OpenAICompatibleChatSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "functions",
      "functionCall",
      "temperature",
      "topP",
      "presencePenalty",
      "frequencyPenalty",
      "logitBias",
      "seed",
      "responseFormat",
    ] satisfies (keyof OpenAICompatibleChatSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  asStructureGenerationModel<INPUT_PROMPT>(
    promptTemplate: StructureFromTextPromptTemplate<
      INPUT_PROMPT,
      OpenAIChatPrompt
    >
  ) {
    return new StructureFromTextStreamingModel({
      model: this,
      template: promptTemplate,
    });
  }

  /**
   * Returns this model with a text prompt template.
   */
  withTextPrompt() {
    return this.withPromptTemplate(text());
  }

  /**
   * Returns this model with an instruction prompt template.
   */
  withInstructionPrompt() {
    return this.withPromptTemplate(instruction());
  }

  /**
   * Returns this model with a chat prompt template.
   */
  withChatPrompt() {
    return this.withPromptTemplate(chat());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, OpenAIChatPrompt>
  ): PromptTemplateFullTextModel<
    INPUT_PROMPT,
    OpenAIChatPrompt,
    OpenAICompatibleChatSettings,
    this
  > {
    return new PromptTemplateFullTextModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      }),
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<OpenAICompatibleChatSettings>) {
    return new OpenAICompatibleChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
