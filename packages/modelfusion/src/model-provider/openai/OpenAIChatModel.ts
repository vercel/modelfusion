import z from "zod";
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

// https://platform.openai.com/docs/models
// Open AI base chat models and their context window sizes.
export const OPENAI_CHAT_CONTEXT_WINDOW_SIZES = {
  "gpt-4": 8192,
  "gpt-4-0314": 8192,
  "gpt-4-0613": 8192,
  "gpt-4-turbo-preview": 128000,
  "gpt-4-1106-preview": 128000,
  "gpt-4-0125-preview": 128000,
  "gpt-4-vision-preview": 128000,
  "gpt-4-32k": 32768,
  "gpt-4-32k-0314": 32768,
  "gpt-4-32k-0613": 32768,
  "gpt-3.5-turbo": 4096,
  "gpt-3.5-turbo-0125": 16385,
  "gpt-3.5-turbo-1106": 16385,
  "gpt-3.5-turbo-0301": 4096,
  "gpt-3.5-turbo-0613": 4096,
  "gpt-3.5-turbo-16k": 16384,
  "gpt-3.5-turbo-16k-0613": 16384,
} as const;

export type OpenAIChatModelBaseType =
  keyof typeof OPENAI_CHAT_CONTEXT_WINDOW_SIZES;

type FineTuneableOpenAIChatModelType =
  | `gpt-3.5-turbo`
  | `gpt-3.5-turbo-0613`
  | `gpt-4-0613`;

type FineTunedOpenAIChatModelType =
  `ft:${FineTuneableOpenAIChatModelType}:${string}:${string}:${string}`;

export type OpenAIChatBaseModelType =
  keyof typeof OPENAI_CHAT_CONTEXT_WINDOW_SIZES;

export interface OpenAIChatSettings extends AbstractOpenAIChatSettings {
  model: OpenAIChatModelType;
}

export type OpenAIChatModelType =
  | OpenAIChatBaseModelType
  | FineTunedOpenAIChatModelType;

export const openAIChatResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal("assistant"),
        content: z.string().nullable(),
        function_call: z
          .object({
            name: z.string(),
            arguments: z.string(),
          })
          .optional(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            })
          )
          .optional(),
      }),
      index: z.number().optional(), // optional for OpenAI compatible models
      logprobs: z.nullable(z.any()),
      finish_reason: z
        .enum([
          "stop",
          "length",
          "tool_calls",
          "content_filter",
          "function_call",
        ])
        .optional()
        .nullable(),
    })
  ),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().optional().nullable(),
  object: z.literal("chat.completion"),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAIChatResponse = z.infer<typeof openAIChatResponseSchema>;

export const openaiChatChunkSchema = z.object({
  object: z.string(), // generalized for openai compatible providers, z.literal("chat.completion.chunk")
  id: z.string(),
  choices: z.array(
    z.object({
      delta: z.object({
        role: z.enum(["assistant", "user"]).optional(),
        content: z.string().nullable().optional(),
        function_call: z
          .object({
            name: z.string().optional(),
            arguments: z.string().optional(),
          })
          .optional(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            })
          )
          .optional(),
      }),
      finish_reason: z
        .enum([
          "stop",
          "length",
          "tool_calls",
          "content_filter",
          "function_call",
        ])
        .nullable()
        .optional(),
      index: z.number(),
    })
  ),
  created: z.number(),
  model: z.string().optional(), // optional for OpenAI compatible models
  system_fingerprint: z.string().optional().nullable(),
});

export type OpenAIChatChunk = z.infer<typeof openaiChatChunkSchema>;

export function getOpenAIChatModelInformation(model: OpenAIChatModelType): {
  baseModel: OpenAIChatBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
} {
  // Model is already a base model:
  if (model in OPENAI_CHAT_CONTEXT_WINDOW_SIZES) {
    const contextWindowSize =
      OPENAI_CHAT_CONTEXT_WINDOW_SIZES[model as OpenAIChatBaseModelType];

    return {
      baseModel: model as OpenAIChatBaseModelType,
      isFineTuned: false,
      contextWindowSize,
    };
  }

  // Extract the base model from the fine-tuned model:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, baseModel, ___, ____, _____] = model.split(":");

  if (
    ["gpt-3.5-turbo", "gpt-3.5-turbo-0613", "gpt-4-0613"].includes(baseModel)
  ) {
    const fineTunedBaseModel = baseModel as FineTuneableOpenAIChatModelType;
    const contextWindowSize =
      OPENAI_CHAT_CONTEXT_WINDOW_SIZES[fineTunedBaseModel];

    return {
      baseModel: fineTunedBaseModel,
      isFineTuned: true,
      contextWindowSize,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
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
