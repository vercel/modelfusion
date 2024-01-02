import {
  FlexibleStructureFromTextPromptTemplate,
  StructureFromTextPromptTemplate,
} from "../../model-function/generate-structure/StructureFromTextPromptTemplate.js";
import { StructureFromTextStreamingModel } from "../../model-function/generate-structure/StructureFromTextStreamingModel.js";
import { PromptTemplateFullTextModel } from "../../model-function/generate-text/PromptTemplateFullTextModel.js";
import {
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ToolCallGenerationModel } from "../../tool/generate-tool-call/ToolCallGenerationModel.js";
import { ToolCallsGenerationModel } from "../../tool/generate-tool-calls/ToolCallsGenerationModel.js";
import {
  AbstractOpenAIChatModel,
  AbstractOpenAIChatSettings,
  OpenAIChatPrompt,
  OpenAIChatResponse,
} from "./AbstractOpenAIChatModel.js";
import { OpenAIChatFunctionCallStructureGenerationModel } from "./OpenAIChatFunctionCallStructureGenerationModel.js";
import {
  chat,
  identity,
  instruction,
  text,
} from "./OpenAIChatPromptTemplate.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";

/*
 * Available OpenAI chat models, their token limits, and pricing.
 *
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_CHAT_MODELS = {
  "gpt-4": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0314": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0613": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
    fineTunedPromptTokenCostInMillicents: null,
    fineTunedCompletionTokenCostInMillicents: null,
  },
  "gpt-4-1106-preview": {
    contextWindowSize: 128000,
    promptTokenCostInMillicents: 1,
    completionTokenCostInMillicents: 3,
  },
  "gpt-4-vision-preview": {
    contextWindowSize: 128000,
    promptTokenCostInMillicents: 1,
    completionTokenCostInMillicents: 3,
  },
  "gpt-4-32k": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0314": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0613": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-3.5-turbo": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
    fineTunedPromptTokenCostInMillicents: 0.3,
    fineTunedCompletionTokenCostInMillicents: 0.6,
  },
  "gpt-3.5-turbo-1106": {
    contextWindowSize: 16385,
    promptTokenCostInMillicents: 0.1,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0301": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0613": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
    fineTunedPromptTokenCostInMillicents: 1.2,
    fineTunedCompletionTokenCostInMillicents: 1.6,
  },
  "gpt-3.5-turbo-16k": {
    contextWindowSize: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
  "gpt-3.5-turbo-16k-0613": {
    contextWindowSize: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
};

export function getOpenAIChatModelInformation(model: OpenAIChatModelType): {
  baseModel: OpenAIChatBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number | null;
  completionTokenCostInMillicents: number | null;
} {
  // Model is already a base model:
  if (model in OPENAI_CHAT_MODELS) {
    const baseModelInformation =
      OPENAI_CHAT_MODELS[model as OpenAIChatBaseModelType];

    return {
      baseModel: model as OpenAIChatBaseModelType,
      isFineTuned: false,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.promptTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.completionTokenCostInMillicents,
    };
  }

  // Extract the base model from the fine-tuned model:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, baseModel, ___, ____, _____] = model.split(":");

  if (
    ["gpt-3.5-turbo", "gpt-3.5-turbo-0613", "gpt-4-0613"].includes(baseModel)
  ) {
    const baseModelInformation =
      OPENAI_CHAT_MODELS[baseModel as FineTuneableOpenAIChatModelType];

    return {
      baseModel: baseModel as FineTuneableOpenAIChatModelType,
      isFineTuned: true,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.fineTunedPromptTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.fineTunedCompletionTokenCostInMillicents,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
}

type FineTuneableOpenAIChatModelType =
  | `gpt-3.5-turbo`
  | `gpt-3.5-turbo-0613`
  | `gpt-4-0613`;

type FineTunedOpenAIChatModelType =
  `ft:${FineTuneableOpenAIChatModelType}:${string}:${string}:${string}`;

export type OpenAIChatBaseModelType = keyof typeof OPENAI_CHAT_MODELS;

export type OpenAIChatModelType =
  | OpenAIChatBaseModelType
  | FineTunedOpenAIChatModelType;

export const isOpenAIChatModel = (
  model: string
): model is OpenAIChatModelType =>
  model in OPENAI_CHAT_MODELS ||
  model.startsWith("ft:gpt-3.5-turbo-0613:") ||
  model.startsWith("ft:gpt-3.5-turbo:");

export const calculateOpenAIChatCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAIChatModelType;
  response: OpenAIChatResponse;
}): number | null => {
  const { promptTokenCostInMillicents, completionTokenCostInMillicents } =
    getOpenAIChatModelInformation(model);

  // null: when cost is unknown, e.g. for fine-tuned models where the price is not yet known
  if (
    promptTokenCostInMillicents == null ||
    completionTokenCostInMillicents == null
  ) {
    return null;
  }

  return (
    response.usage.prompt_tokens * promptTokenCostInMillicents +
    response.usage.completion_tokens * completionTokenCostInMillicents
  );
};

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
    TextStreamingModel<OpenAIChatPrompt, OpenAIChatSettings>,
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

  asFunctionCallStructureGenerationModel({
    fnName,
    fnDescription,
  }: {
    fnName: string;
    fnDescription?: string;
  }) {
    return new OpenAIChatFunctionCallStructureGenerationModel({
      model: this,
      fnName,
      fnDescription,
      promptTemplate: identity(),
    });
  }

  asStructureGenerationModel<INPUT_PROMPT, OpenAIChatPrompt>(
    promptTemplate:
      | StructureFromTextPromptTemplate<INPUT_PROMPT, OpenAIChatPrompt>
      | FlexibleStructureFromTextPromptTemplate<INPUT_PROMPT, unknown>
  ) {
    return "adaptModel" in promptTemplate
      ? new StructureFromTextStreamingModel({
          model: promptTemplate.adaptModel(this),
          template: promptTemplate,
        })
      : new StructureFromTextStreamingModel({
          model: this as TextStreamingModel<OpenAIChatPrompt>,
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
