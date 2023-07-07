import { z } from "zod";
import { AbstractModel } from "../../model/AbstractModel.js";
import { FunctionOptions } from "../../model/FunctionOptions.js";
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
import { CohereTokenizer } from "./CohereTokenizer.js";
import { failedCohereCallResponseHandler } from "./failedCohereCallResponseHandler.js";

export const COHERE_TEXT_GENERATION_MODELS = {
  command: {
    maxTokens: 2048,
  },
  "command-nightly": {
    maxTokens: 2048,
  },
  "command-light": {
    maxTokens: 2048,
  },
  "command-light-nightly": {
    maxTokens: 2048,
  },
};

export type CohereTextGenerationModelType =
  keyof typeof COHERE_TEXT_GENERATION_MODELS;

export interface CohereTextGenerationModelSettings
  extends TextGenerationModelSettings {
  model: CohereTextGenerationModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  tokenizerSettings?: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  };

  numGenerations?: number;
  maxTokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  endSequences?: string[];
  stopSequences?: string[];
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";
}

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const textGenerationModel = new CohereTextGenerationModel({
 *   model: "command-nightly",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * const text = await textGenerationModel.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class CohereTextGenerationModel
  extends AbstractModel<CohereTextGenerationModelSettings>
  implements
    TextGenerationModelWithTokenization<
      string,
      CohereTextGenerationResponse,
      CohereTextGenerationModelSettings
    >
{
  constructor(settings: CohereTextGenerationModelSettings) {
    super({ settings });

    this.maxTokens =
      COHERE_TEXT_GENERATION_MODELS[this.settings.model].maxTokens;

    this.tokenizer = new CohereTokenizer({
      baseUrl: this.settings.baseUrl,
      apiKey: this.settings.apiKey,
      model: this.settings.model,
      retry: this.settings.tokenizerSettings?.retry,
      throttle: this.settings.tokenizerSettings?.throttle,
    });
  }

  readonly provider = "cohere" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly maxTokens: number;
  readonly tokenizer: Tokenizer;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.COHERE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Cohere API key provided. Pass an API key to the constructor or set the COHERE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  async countPromptTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async callAPI(
    prompt: string,
    options?: FunctionOptions<CohereTextGenerationModelSettings>
  ): Promise<CohereTextGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        prompt,
      }
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callCohereTextGenerationAPI(callSettings),
    });
  }

  generateTextResponse(
    prompt: string,
    options?: FunctionOptions<CohereTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, options);
  }

  extractText(response: CohereTextGenerationResponse): string {
    return response.generations[0].text;
  }

  withSettings(additionalSettings: Partial<CohereTextGenerationModelSettings>) {
    return new CohereTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}

const cohereTextGenerationResponseSchema = z.object({
  id: z.string(),
  generations: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  prompt: z.string(),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTextGenerationResponse = z.infer<
  typeof cohereTextGenerationResponseSchema
>;

/**
 * Call the Cohere Co.Generate API to generate a text completion for the given prompt.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const response = await callCohereTextGenerationAPI({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 *   prompt: "Write a short story about a robot learning to love:\n\n",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * console.log(response.generations[0].text);
 */
async function callCohereTextGenerationAPI({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  prompt,
  numGenerations,
  maxTokens,
  temperature,
  k,
  p,
  frequencyPenalty,
  presencePenalty,
  endSequences,
  stopSequences,
  returnLikelihoods,
  logitBias,
  truncate,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: CohereTextGenerationModelType;
  prompt: string;
  numGenerations?: number;
  maxTokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  endSequences?: string[];
  stopSequences?: string[];
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";
}): Promise<CohereTextGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/generate`,
    apiKey,
    body: {
      model,
      prompt,
      num_generations: numGenerations,
      max_tokens: maxTokens,
      temperature,
      k,
      p,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      end_sequences: endSequences,
      stop_sequences: stopSequences,
      return_likelihoods: returnLikelihoods,
      logit_bias: logitBias,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTextGenerationResponseSchema
    ),
    abortSignal,
  });
}
