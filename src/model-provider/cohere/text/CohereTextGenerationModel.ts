import { RunContext } from "../../../run/RunContext.js";
import { AbstractTextGenerationModel } from "../../../text/generate/AbstractTextGenerationModel.js";
import {
  BaseTextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { throttleUnlimitedConcurrency } from "../../../util/throttle/UnlimitedConcurrencyThrottler.js";
import { CohereTokenizer } from "../tokenizer/CohereTokenizer.js";
import { CohereTextGenerationResponse } from "./CohereTextGenerationResponse.js";
import { callCohereTextGenerationAPI } from "./callCohereTextGenerationAPI.js";

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

export type CohereTextGenerationModelSettings =
  BaseTextGenerationModelSettings & {
    model: CohereTextGenerationModelType;

    baseUrl?: string;
    apiKey?: string;

    retry?: RetryFunction;
    throttle?: ThrottleFunction;

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
  };

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const textGenerationModel = new CohereTextGenerationModel({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 *   settings: { temperature: 0.7 },
 * });
 *
 * const response = await textGenerationModel
 *   .withSettings({ maxTokens: 500 })
 *   .generate("Write a short story about a robot learning to love:\n\n");
 *
 * const text = await textGenerationModel.extractText(response);
 */
export class CohereTextGenerationModel
  extends AbstractTextGenerationModel<
    string,
    CohereTextGenerationResponse,
    CohereTextGenerationModelSettings
  >
  implements
    TextGenerationModelWithTokenization<
      string,
      CohereTextGenerationModelSettings
    >
{
  constructor(settings: CohereTextGenerationModelSettings) {
    super({
      settings,
      extractText: (response) => response.generations[0].text,
      generateResponse: (prompt, context) => this.callAPI(prompt, context),
    });

    this.maxTokens =
      COHERE_TEXT_GENERATION_MODELS[this.settings.model].maxTokens;
    this.tokenizer = CohereTokenizer.forModel({
      apiKey: this.apiKey,
      model: this.model,
    });
  }

  readonly provider = "cohere";
  get model() {
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

  private get retry() {
    return this.settings.retry ?? retryWithExponentialBackoff();
  }

  private get throttle() {
    return this.settings.throttle ?? throttleUnlimitedConcurrency();
  }

  async countPromptTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async callAPI(
    prompt: string,
    context?: RunContext
  ): Promise<CohereTextGenerationResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callCohereTextGenerationAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          prompt,
          ...this.settings,
        })
      )
    );
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
