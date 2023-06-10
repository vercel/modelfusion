import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { CohereTextEmbeddingModelType } from "../index.js";
import { CohereTextGenerationModelType } from "../CohereTextGenerationModel.js";
import { callCohereDetokenizeAPI } from "./callCohereDetokenizeAPI.js";
import { callCohereTokenizeAPI } from "./callCohereTokenizeAPI.js";

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
  static forModel({
    baseUrl,
    apiKey,
    model,
  }: {
    baseUrl?: string;
    apiKey: string;
    model: CohereTokenizerModelType;
  }): Tokenizer {
    return new CohereTokenizer({ baseUrl, apiKey, model });
  }

  readonly baseUrl?: string;
  readonly apiKey: string;
  readonly model: CohereTokenizerModelType;

  private constructor({
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
