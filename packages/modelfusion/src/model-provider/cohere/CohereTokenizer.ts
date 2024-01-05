import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTextEmbeddingModelType } from "./CohereTextEmbeddingModel.js";
import { CohereTextGenerationModelType } from "./CohereTextGenerationModel.js";

export type CohereTokenizerModelType =
  | CohereTextGenerationModelType
  | CohereTextEmbeddingModelType;

export interface CohereTokenizerSettings {
  api?: ApiConfiguration;
  model: CohereTokenizerModelType;
}

/**
 * Tokenizer for the Cohere models. It uses the Co.Tokenize and Co.Detokenize APIs.
 *
 * @see https://docs.cohere.com/reference/tokenize
 * @see https://docs.cohere.com/reference/detokenize
 *
 * @example
 * const tokenizer = new CohereTokenizer({ model: "command" });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * const tokenCount = await countTokens(tokenizer, text);
 * const tokens = await tokenizer.tokenize(text);
 * const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
 * const reconstructedText = await tokenizer.detokenize(tokens);
 */
export class CohereTokenizer implements FullTokenizer {
  readonly settings: CohereTokenizerSettings;

  constructor(settings: CohereTokenizerSettings) {
    this.settings = settings;
  }

  async callTokenizeAPI(
    text: string,
    callOptions?: FunctionCallOptions
  ): Promise<CohereTokenizationResponse> {
    const api = this.settings.api ?? new CohereApiConfiguration();
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
            model: this.settings.model,
            text,
          },
          failedResponseHandler: failedCohereCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(cohereTokenizationResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  async callDeTokenizeAPI(
    tokens: number[],
    callOptions?: FunctionCallOptions
  ): Promise<CohereDetokenizationResponse> {
    const api = this.settings.api ?? new CohereApiConfiguration();
    const abortSignal = callOptions?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/detokenize`),
          headers: api.headers({
            functionType: "detokenize",
            functionId: callOptions?.functionId,
            run: callOptions?.run,
            callId: "",
          }),
          body: {
            model: this.settings.model,
            tokens,
          },
          failedResponseHandler: failedCohereCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(cohereDetokenizationResponseSchema)
          ),
          abortSignal,
        }),
    });
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
