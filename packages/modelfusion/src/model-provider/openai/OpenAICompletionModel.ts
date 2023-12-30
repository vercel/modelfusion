import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import {
  chat,
  instruction,
} from "../../model-function/generate-text/prompt-template/TextPromptTemplate.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import {
  AbstractOpenAICompletionModel,
  AbstractOpenAICompletionModelSettings,
  OpenAICompletionResponse,
} from "./AbstractOpenAICompletionModel.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";

/**
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "gpt-3.5-turbo-instruct": {
    contextWindowSize: 4097,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "davinci-002": {
    contextWindowSize: 16_384,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
    fineTunedTokenCostInMillicents: 1.2,
  },
  "babbage-002": {
    contextWindowSize: 16_384,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
    fineTunedTokenCostInMillicents: 0.16,
  },
  "text-davinci-003": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "text-davinci-002": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "code-davinci-002": {
    contextWindowSize: 8000,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  davinci: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "text-curie-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
  },
  curie: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
  },
  "text-babbage-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.05,
    completionTokenCostInMillicents: 0.05,
  },
  babbage: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.05,
    completionTokenCostInMillicents: 0.05,
  },
  "text-ada-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
  },
  ada: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
  },
};

export function getOpenAICompletionModelInformation(
  model: OpenAICompletionModelType
): {
  baseModel: OpenAICompletionBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number;
  completionTokenCostInMillicents: number;
} {
  // Model is already a base model:
  if (model in OPENAI_TEXT_GENERATION_MODELS) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[model as OpenAICompletionBaseModelType];

    return {
      baseModel: model as OpenAICompletionBaseModelType,
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

  if (["davinci-002", "babbage-002"].includes(baseModel)) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[
        baseModel as FineTuneableOpenAICompletionModelType
      ];

    return {
      baseModel: baseModel as FineTuneableOpenAICompletionModelType,
      isFineTuned: true,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.fineTunedTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.fineTunedTokenCostInMillicents,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
}

type FineTuneableOpenAICompletionModelType = "davinci-002" | "babbage-002";

type FineTunedOpenAICompletionModelType =
  `ft:${FineTuneableOpenAICompletionModelType}:${string}:${string}:${string}`;

export type OpenAICompletionBaseModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAICompletionModelType =
  | OpenAICompletionBaseModelType
  | FineTunedOpenAICompletionModelType;

export const isOpenAICompletionModel = (
  model: string
): model is OpenAICompletionModelType =>
  model in OPENAI_TEXT_GENERATION_MODELS ||
  model.startsWith("ft:davinci-002:") ||
  model.startsWith("ft:babbage-002:");

export const calculateOpenAICompletionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAICompletionModelType;
  response: OpenAICompletionResponse;
}) => {
  const modelInformation = getOpenAICompletionModelInformation(model);

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};

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
  implements TextStreamingModel<string, OpenAICompletionModelSettings>
{
  constructor(settings: OpenAICompletionModelSettings) {
    super(settings);

    const modelInformation = getOpenAICompletionModelInformation(
      this.settings.model
    );

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

  /**
   * Returns this model with an instruction prompt template.
   */
  withInstructionPrompt() {
    return this.withPromptTemplate(instruction());
  }

  /**
   * Returns this model with a chat prompt template.
   */
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
