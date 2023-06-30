import z from "zod";
import { FunctionOptions } from "../../model/FunctionOptions.js";
import { AbstractTextGenerationModel } from "../../model/text-generation/AbstractTextGenerationModel.js";
import {
  TextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../model/text-generation/TextGenerationModel.js";
import { Tokenizer } from "../../model/tokenization/Tokenizer.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { OpenAIImageGenerationCallSettings } from "./OpenAIImageGenerationModel.js";
import { OpenAIModelSettings } from "./OpenAIModelSettings.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";
import { failedOpenAICallResponseHandler } from "./failedOpenAICallResponseHandler.js";

/**
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "text-davinci-003": {
    maxTokens: 4096,
    tokenCostInMillicents: 2,
  },
  "text-davinci-002": {
    maxTokens: 4096,
    tokenCostInMillicents: 2,
  },
  "code-davinci-002": {
    maxTokens: 8000,
    tokenCostInMillicents: 2,
  },
  davinci: {
    maxTokens: 2048,
    tokenCostInMillicents: 2,
  },
  "text-curie-001": {
    maxTokens: 2048,
    tokenCostInMillicents: 0.2,
  },
  curie: {
    maxTokens: 2048,
    tokenCostInMillicents: 0.2,
  },
  "text-babbage-001": {
    maxTokens: 2048,
    tokenCostInMillicents: 0.05,
  },
  babbage: {
    maxTokens: 2048,
    tokenCostInMillicents: 0.05,
  },
  "text-ada-001": {
    maxTokens: 2048,
    tokenCostInMillicents: 0.04,
  },
  ada: {
    maxTokens: 2048,
    tokenCostInMillicents: 0.04,
  },
};

export type OpenAITextGenerationModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export const isOpenAITextGenerationModel = (
  model: string
): model is OpenAITextGenerationModelType =>
  model in OPENAI_TEXT_GENERATION_MODELS;

export const calculateOpenAITextGenerationCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAITextGenerationModelType;
  response: OpenAITextGenerationResponse;
}) =>
  response.usage.total_tokens *
  OPENAI_TEXT_GENERATION_MODELS[model].tokenCostInMillicents;

export interface OpenAITextGenerationModelSettings
  extends TextGenerationModelSettings {
  model: OpenAITextGenerationModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  isUserIdForwardingEnabled?: boolean;

  suffix?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
}

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAITextGenerationModel({
 *   model: "text-davinci-003",
 *   temperature: 0.7,
 *   maxTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await model.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class OpenAITextGenerationModel
  extends AbstractTextGenerationModel<
    string,
    OpenAITextGenerationResponse,
    OpenAITextGenerationModelSettings
  >
  implements
    TextGenerationModelWithTokenization<
      string,
      OpenAITextGenerationModelSettings
    >
{
  constructor(settings: OpenAITextGenerationModelSettings) {
    super({
      settings,
      extractText: (response) => response.choices[0]!.text,
      generateResponse: (prompt, options) => this.callAPI(prompt, options),
    });

    this.tokenizer = new TikTokenTokenizer({ model: settings.model });
    this.maxTokens = OPENAI_TEXT_GENERATION_MODELS[settings.model].maxTokens;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  async countPromptTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async callAPI(
    prompt: string,
    options?: FunctionOptions<
      Partial<
        OpenAIImageGenerationCallSettings &
          OpenAIModelSettings & { user?: string }
      >
    >
  ): Promise<OpenAITextGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
        user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        prompt,
      }
    );

    return callWithRetryAndThrottle({
      retry: callSettings.retry,
      throttle: callSettings.throttle,
      call: async () => callOpenAITextGenerationAPI(callSettings),
    });
  }

  withSettings(additionalSettings: Partial<OpenAITextGenerationModelSettings>) {
    return new OpenAITextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}

const openAITextGenerationResponseSchema = z.object({
  id: z.string(),
  object: z.literal("text_completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      text: z.string(),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAITextGenerationResponse = z.infer<
  typeof openAITextGenerationResponseSchema
>;

/**
 * Call the OpenAI Text Completion API to generate a text completion for the given prompt.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const response = await callOpenAITextGenerationAPI({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-davinci-003",
 *   prompt: "Write a short story about a robot learning to love:\n\n",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * console.log(response.choices[0].text);
 */
async function callOpenAITextGenerationAPI({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  model,
  prompt,
  suffix,
  maxTokens,
  temperature,
  topP,
  n,
  logprobs,
  echo,
  stop,
  presencePenalty,
  frequencyPenalty,
  bestOf,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: OpenAITextGenerationModelType;
  prompt: string;
  suffix?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
  user?: string;
}): Promise<OpenAITextGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/completions`,
    apiKey,
    body: {
      model,
      prompt,
      suffix,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      n,
      logprobs,
      echo,
      stop,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      best_of: bestOf,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      openAITextGenerationResponseSchema
    ),
    abortSignal,
  });
}
