import { StructureFromTextPromptFormat } from "../../model-function/generate-structure/StructureFromTextPromptFormat.js";
import { StructureFromTextStreamingModel } from "../../model-function/generate-structure/StructureFromTextStreamingModel.js";
import { PromptFormatTextStreamingModel } from "../../model-function/generate-text/PromptFormatTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { ToolCallGenerationModel } from "../../tool/generate-tool-call/ToolCallGenerationModel.js";
import { ToolCallsOrTextGenerationModel } from "../../tool/generate-tool-calls-or-text/ToolCallsOrTextGenerationModel.js";
import {
  AbstractOpenAIChatCallSettings,
  AbstractOpenAIChatModel,
  OpenAIChatPrompt,
} from "../openai/chat/AbstractOpenAIChatModel.js";
import {
  chat,
  instruction,
  text,
} from "../openai/chat/OpenAIChatPromptFormat.js";

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
      "stopSequences",
      "maxCompletionTokens",

      "functions",
      "functionCall",
      "temperature",
      "topP",
      "n",
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
    promptFormat: StructureFromTextPromptFormat<INPUT_PROMPT, OpenAIChatPrompt>
  ) {
    return new StructureFromTextStreamingModel({
      model: this,
      format: promptFormat,
    });
  }

  /**
   * Returns this model with a text prompt format.
   */
  withTextPrompt() {
    return this.withPromptFormat(text());
  }

  /**
   * Returns this model with an instruction prompt format.
   */
  withInstructionPrompt() {
    return this.withPromptFormat(instruction());
  }

  /**
   * Returns this model with a chat prompt format.
   */
  withChatPrompt() {
    return this.withPromptFormat(chat());
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, OpenAIChatPrompt>
  ): PromptFormatTextStreamingModel<
    INPUT_PROMPT,
    OpenAIChatPrompt,
    OpenAICompatibleChatSettings,
    this
  > {
    return new PromptFormatTextStreamingModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptFormat.stopSequences,
        ],
      }),
      promptFormat,
    });
  }

  withSettings(additionalSettings: Partial<OpenAICompatibleChatSettings>) {
    return new OpenAICompatibleChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
