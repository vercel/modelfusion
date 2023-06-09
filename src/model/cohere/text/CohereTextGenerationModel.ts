import { createId } from "@paralleldrive/cuid2";
import { doGenerateText } from "../../../internal/doGenerateText.js";
import { PromptTemplate } from "../../../run/PromptTemplate.js";
import { RunContext } from "../../../run/RunContext.js";
import { RunObserver } from "../../../run/RunObserver.js";
import { TextGenerationModelWithTokenization } from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { CohereTokenizer } from "../tokenizer/CohereTokenizer.js";
import { callCohereTextGenerationAPI } from "./callCohereTextGenerationAPI.js";
import { CohereTextGenerationResponse } from "./CohereTextGenerationResponse.js";

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

export type CohereTextGenerationModelSettings = {
  model: CohereTextGenerationModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  observers?: Array<RunObserver>;
  uncaughtErrorHandler?: (error: unknown) => void;

  trimOutput?: boolean;

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
  implements TextGenerationModelWithTokenization<string>
{
  readonly provider = "cohere";

  readonly settings: CohereTextGenerationModelSettings;

  readonly maxTokens: number;
  readonly tokenizer: Tokenizer;

  constructor(settings: CohereTextGenerationModelSettings) {
    this.settings = settings;

    this.maxTokens =
      COHERE_TEXT_GENERATION_MODELS[this.settings.model].maxTokens;
    this.tokenizer = CohereTokenizer.forModel({
      apiKey: this.apiKey,
      model: this.model,
    });
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.COHERE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Cohere API key provided. Pass an API key to the constructor or set the COHERE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  get model() {
    return this.settings.model;
  }

  get retry() {
    return this.settings.retry ?? retryWithExponentialBackoff();
  }

  get throttle() {
    return (
      this.settings.throttle ??
      throttleMaxConcurrency({ maxConcurrentCalls: 5 })
    );
  }

  get uncaughtErrorHandler() {
    return (
      this.settings.uncaughtErrorHandler ??
      ((error) => {
        console.error(error);
      })
    );
  }

  async countPromptTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async generate(
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

  async generateText(prompt: string, context?: RunContext): Promise<string> {
    return await doGenerateText({
      prompt,
      generate: () => this.generate(prompt, context),
      extractText: async (response) => {
        const text = response.generations[0].text;
        return this.settings.trimOutput ? text.trim() : text;
      },
      model: { provider: this.provider, name: this.model },
      createId,
      uncaughtErrorHandler: this.uncaughtErrorHandler,
      observers: this.settings.observers,
      context,
    });
  }

  generateTextAsFunction<INPUT>(promptTemplate: PromptTemplate<INPUT, string>) {
    return async (input: INPUT, context?: RunContext) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateText(expandedPrompt, context);
    };
  }

  withSettings(additionalSettings: Partial<CohereTextGenerationModelSettings>) {
    return new CohereTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    );
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}
