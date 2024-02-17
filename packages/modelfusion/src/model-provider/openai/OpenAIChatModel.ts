import {
  FlexibleObjectFromTextPromptTemplate,
  ObjectFromTextPromptTemplate,
} from "../../model-function/generate-object/ObjectFromTextPromptTemplate";
import { ObjectFromTextStreamingModel } from "../../model-function/generate-object/ObjectFromTextStreamingModel";
import { PromptTemplateFullTextModel } from "../../model-function/generate-text/PromptTemplateFullTextModel";
import {
  TextStreamingBaseModel,
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate";
import { ToolCallGenerationModel } from "../../tool/generate-tool-call/ToolCallGenerationModel";
import { ToolCallsGenerationModel } from "../../tool/generate-tool-calls/ToolCallsGenerationModel";
import {
  AbstractOpenAIChatModel,
  AbstractOpenAIChatSettings,
  OpenAIChatPrompt,
} from "./AbstractOpenAIChatModel";
import { OpenAIChatFunctionCallObjectGenerationModel } from "./OpenAIChatFunctionCallObjectGenerationModel";
import { chat, identity, instruction, text } from "./OpenAIChatPromptTemplate";
import { TikTokenTokenizer } from "./TikTokenTokenizer";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens";

import {
  OpenAIChatModelType,
  getOpenAIChatModelInformation,
} from "@modelfusion/types";

export interface OpenAIChatSettings extends AbstractOpenAIChatSettings {
  model: OpenAIChatModelType;
}

/**
 * Create a text generation model that calls the OpenAI chat API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const model = new OpenAIChatModel({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 * });
 *
 * const text = await generateText([
 *   model,
 *   openai.ChatMessage.system(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export class OpenAIChatModel
  extends AbstractOpenAIChatModel<OpenAIChatSettings>
  implements
    TextStreamingBaseModel<OpenAIChatPrompt, OpenAIChatSettings>,
    ToolCallGenerationModel<OpenAIChatPrompt, OpenAIChatSettings>,
    ToolCallsGenerationModel<OpenAIChatPrompt, OpenAIChatSettings>
{
  constructor(settings: OpenAIChatSettings) {
    super(settings);

    const modelInformation = getOpenAIChatModelInformation(this.settings.model);

    this.tokenizer = new TikTokenTokenizer({
      model: modelInformation.baseModel,
    });
    this.contextWindowSize = modelInformation.contextWindowSize;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: TikTokenTokenizer;

  /**
   * Counts the prompt tokens required for the messages. This includes the message base tokens
   * and the prompt base tokens.
   */
  countPromptTokens(messages: OpenAIChatPrompt) {
    return countOpenAIChatPromptTokens({
      messages,
      model: this.modelName,
    });
  }

  get settingsForEvent(): Partial<OpenAIChatSettings> {
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
    ] satisfies (keyof OpenAIChatSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  asFunctionCallObjectGenerationModel({
    fnName,
    fnDescription,
  }: {
    fnName: string;
    fnDescription?: string;
  }) {
    return new OpenAIChatFunctionCallObjectGenerationModel({
      model: this,
      fnName,
      fnDescription,
      promptTemplate: identity(),
    });
  }

  asObjectGenerationModel<INPUT_PROMPT, OpenAIChatPrompt>(
    promptTemplate:
      | ObjectFromTextPromptTemplate<INPUT_PROMPT, OpenAIChatPrompt>
      | FlexibleObjectFromTextPromptTemplate<INPUT_PROMPT, unknown>
  ) {
    return "adaptModel" in promptTemplate
      ? new ObjectFromTextStreamingModel({
          model: promptTemplate.adaptModel(this),
          template: promptTemplate,
        })
      : new ObjectFromTextStreamingModel({
          model: this as TextStreamingModel<OpenAIChatPrompt>,
          template: promptTemplate,
        });
  }

  withTextPrompt() {
    return this.withPromptTemplate(text());
  }

  withInstructionPrompt() {
    return this.withPromptTemplate(instruction());
  }

  withChatPrompt() {
    return this.withPromptTemplate(chat());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, OpenAIChatPrompt>
  ): PromptTemplateFullTextModel<
    INPUT_PROMPT,
    OpenAIChatPrompt,
    OpenAIChatSettings,
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

  withJsonOutput() {
    return this.withSettings({ responseFormat: { type: "json_object" } });
  }

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
