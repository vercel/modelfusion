import z from "zod";
import { Tokenizer } from "../../model/tokenization/Tokenizer.js";
import { Run } from "../../run/Run.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTextGenerationModelType } from "./CohereTextGenerationModel.js";
import { CohereTextEmbeddingModelType } from "./index.js";

export type CohereTokenizerModelType =
  | CohereTextGenerationModelType
  | CohereTextEmbeddingModelType;

export interface CohereTokenizerSettings {
  model: CohereTokenizerModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
}

/**
 * Tokenizer for the Cohere models. It uses the Co.Tokenize and Co.Detokenize APIs.
 *
 * @see https://docs.cohere.com/reference/tokenize
 * @see https://docs.cohere.com/reference/detokenize-1
 *
 * @example
 * const tokenizer = new CohereTokenizer({ model: "command-nightly" });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * const tokenCount = await tokenizer.countTokens(text);
 * const tokens = await tokenizer.tokenize(text);
 * const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
 * const reconstructedText = await tokenizer.detokenize(tokens);
 */
export class CohereTokenizer implements Tokenizer {
  readonly settings: CohereTokenizerSettings;

  constructor(settings: CohereTokenizerSettings) {
    this.settings = settings;
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

  async callTokenizeAPI(
    text: string,
    context?: Run
  ): Promise<CohereTokenizationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callCohereTokenizeAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          text,
          ...this.settings,
        }),
    });
  }

  async callDeTokenizeAPI(
    tokens: number[],
    context?: Run
  ): Promise<CohereDetokenizationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callCohereDetokenizeAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          tokens,
          ...this.settings,
        }),
    });
  }

  async countTokens(text: string) {
    return (await this.tokenize(text)).length;
  }

  async tokenize(text: string) {
    return (await this.tokenizeWithTexts(text)).tokens;
  }

  async tokenizeWithTexts(text: string) {
    const response = await this.callTokenizeAPI(text);

    return {
      tokens: response.tokens,
      tokenTexts: response.token_strings,
    };
  }

  async detokenize(tokens: number[]) {
    const response = await this.callDeTokenizeAPI(tokens);

    return response.text;
  }
}

const cohereDetokenizationResponseSchema = z.object({
  text: z.string(),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereDetokenizationResponse = z.infer<
  typeof cohereDetokenizationResponseSchema
>;

/**
 * Call the Cohere Co.Detokenize API to detokenize a text.
 *
 * https://docs.cohere.com/reference/detokenize-1
 */
async function callCohereDetokenizeAPI({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  tokens,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model?: CohereTokenizerModelType;
  tokens: Array<number>;
}): Promise<CohereDetokenizationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/detokenize`,
    apiKey,
    body: {
      model,
      tokens,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereDetokenizationResponseSchema
    ),
    abortSignal,
  });
}

const cohereTokenizationResponseSchema = z.object({
  tokens: z.array(z.number()),
  token_strings: z.array(z.string()),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTokenizationResponse = z.infer<
  typeof cohereTokenizationResponseSchema
>;

/**
 * Call the Cohere Co.Tokenize API to tokenize a text.
 *
 * https://docs.cohere.com/reference/tokenize
 */
async function callCohereTokenizeAPI({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  text,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model?: CohereTokenizerModelType;
  text: string;
}): Promise<CohereTokenizationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/tokenize`,
    apiKey,
    body: {
      model,
      text,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTokenizationResponseSchema
    ),
    abortSignal,
  });
}
