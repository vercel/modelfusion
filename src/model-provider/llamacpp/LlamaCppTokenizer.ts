import z from "zod";
import { Run } from "../../core/Run.js";
import { ApiConfiguration } from "../../model-function/ApiConfiguration.js";
import { BasicTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";

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
  readonly api: ApiConfiguration;

  constructor(api: ApiConfiguration = new LlamaCppApiConfiguration()) {
    this.api = api;
  }

  async callTokenizeAPI(
    text: string,
    context?: Run
  ): Promise<LlamaCppTokenizationResponse> {
    return callWithRetryAndThrottle({
      retry: this.api.retry,
      throttle: this.api.throttle,
      call: async () =>
        callLlamaCppTokenizeAPI({
          api: this.api,
          abortSignal: context?.abortSignal,
          text,
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
  api,
  abortSignal,
  text,
}: {
  api: ApiConfiguration;
  abortSignal?: AbortSignal;
  text: string;
}): Promise<LlamaCppTokenizationResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/tokenize`),
    headers: api.headers,
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
