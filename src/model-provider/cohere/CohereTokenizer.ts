import z from "zod";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../internal/postToApi.js";
import { Tokenizer } from "../../text/tokenize/Tokenizer.js";
import { CohereTextGenerationModelType } from "./CohereTextGenerationModel.js";
import { failedCohereCallResponseHandler } from "./failedCohereCallResponseHandler.js";
import { CohereTextEmbeddingModelType } from "./index.js";

export type CohereTokenizerModelType =
  | CohereTextGenerationModelType
  | CohereTextEmbeddingModelType;

/**
 * Tokenizer for the Cohere models. It uses the Co.Tokenize and Co.Detokenize APIs.
 *
 * @see https://docs.cohere.com/reference/tokenize
 * @see https://docs.cohere.com/reference/detokenize-1
 *
 * @example
 * const tokenizer = CohereTokenizer.forModel({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 * });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * console.log("countTokens", await tokenizer.countTokens(text));
 * console.log("tokenize", await tokenizer.tokenize(text));
 * console.log("tokenizeWithTexts", await tokenizer.tokenizeWithTexts(text));
 * console.log(
 *   "detokenize(tokenize)",
 *   await tokenizer.detokenize(await tokenizer.tokenize(text))
 * );
 */
export class CohereTokenizer implements Tokenizer {
  readonly baseUrl?: string;
  readonly apiKey: string;
  readonly model: CohereTokenizerModelType;

  constructor({
    baseUrl,
    apiKey,
    model,
  }: {
    baseUrl?: string;
    apiKey: string;
    model: CohereTokenizerModelType;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
  }

  async countTokens(text: string) {
    return (await this.tokenize(text)).length;
  }

  async tokenize(text: string) {
    return (await this.tokenizeWithTexts(text)).tokens;
  }

  async tokenizeWithTexts(text: string) {
    const response = await callCohereTokenizeAPI({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      text,
    });

    return {
      tokens: response.tokens,
      tokenTexts: response.token_strings,
    };
  }

  async detokenize(tokens: number[]) {
    const response = await callCohereDetokenizeAPI({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      tokens,
    });

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
