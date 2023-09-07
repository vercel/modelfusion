import z from "zod";
import { Run } from "../../core/Run.js";
import { ApiConfiguration } from "../../model-function/ApiConfiguration.js";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTextEmbeddingModelType } from "./CohereTextEmbeddingModel.js";
import { CohereTextGenerationModelType } from "./CohereTextGenerationModel.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";

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
 * @see https://docs.cohere.com/reference/detokenize-1
 *
 * @example
 * const tokenizer = new CohereTokenizer({ model: "command-nightly" });
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
    context?: Run
  ): Promise<CohereTokenizationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callCohereTokenizeAPI({
          abortSignal: context?.abortSignal,
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
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callCohereDetokenizeAPI({
          abortSignal: context?.abortSignal,
          tokens,
          ...this.settings,
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

async function callCohereDetokenizeAPI({
  api = new CohereApiConfiguration(),
  abortSignal,
  model,
  tokens,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model?: CohereTokenizerModelType;
  tokens: Array<number>;
}): Promise<CohereDetokenizationResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/detokenize`),
    headers: api.headers,
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

async function callCohereTokenizeAPI({
  api = new CohereApiConfiguration(),
  abortSignal,
  model,
  text,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model?: CohereTokenizerModelType;
  text: string;
}): Promise<CohereTokenizationResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/tokenize`),
    headers: api.headers,
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
