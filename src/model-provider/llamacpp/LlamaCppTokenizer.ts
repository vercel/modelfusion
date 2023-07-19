import z from "zod";
import { BasicTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { Run } from "../../run/Run.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";

export interface LlamaCppTokenizerSettings {
  baseUrl?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
}

/**
 * Tokenizer for LlamaCpp.

 * @example
 * const tokenizer = new LlamaCppTokenizer();
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * const tokenCount = await countTokens(tokenizer, text);
 * const tokens = await tokenizer.tokenize(text);
 * const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
 * const reconstructedText = await tokenizer.detokenize(tokens);
 */
export class LlamaCppTokenizer implements BasicTokenizer {
  readonly settings: LlamaCppTokenizerSettings;

  constructor(settings: LlamaCppTokenizerSettings = {}) {
    this.settings = settings;
  }

  async callTokenizeAPI(
    text: string,
    context?: Run
  ): Promise<LlamaCppTokenizationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callLlamaCppTokenizeAPI({
          abortSignal: context?.abortSignal,
          text,
          ...this.settings,
        }),
    });
  }

  async tokenize(text: string) {
    const response = await this.callTokenizeAPI(text);
    return response.tokens;
  }
}

const llamaCppTokenizationResponseSchema = z.object({
  tokens: z.array(z.number()),
});

export type LlamaCppTokenizationResponse = z.infer<
  typeof llamaCppTokenizationResponseSchema
>;

async function callLlamaCppTokenizeAPI({
  baseUrl = "http://127.0.0.1:8080",
  abortSignal,
  text,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  text: string;
}): Promise<LlamaCppTokenizationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/tokenize`,
    body: {
      content: text,
    },
    failedResponseHandler: failedLlamaCppCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      llamaCppTokenizationResponseSchema
    ),
    abortSignal,
  });
}
