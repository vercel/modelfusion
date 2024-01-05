import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { BasicTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
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
    callOptions?: FunctionCallOptions
  ): Promise<LlamaCppTokenizationResponse> {
    const api = this.api;
    const abortSignal = callOptions?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/tokenize`),
          headers: api.headers({
            functionType: "tokenize",
            functionId: callOptions?.functionId,
            run: callOptions?.run,
            callId: "",
          }),
          body: {
            content: text,
          },
          failedResponseHandler: failedLlamaCppCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(llamaCppTokenizationResponseSchema)
          ),
          abortSignal,
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
