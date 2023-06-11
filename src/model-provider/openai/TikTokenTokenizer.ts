import {
  Tiktoken,
  TiktokenEncoding,
  TiktokenModel,
  encodingForModel,
  getEncoding,
} from "js-tiktoken";
import { Tokenizer } from "../../text/tokenize/Tokenizer.js";

/**
 * TikToken tokenizer for OpenAI language models.
 *
 * @see https://github.com/openai/tiktoken
 *
 * @example
 * const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * const tokenCount = await tokenizer.countTokens(text);
 * const tokens = await tokenizer.tokenize(text);
 * const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
 * const reconstructedText = await tokenizer.detokenize(tokens);
 */
export class TikTokenTokenizer implements Tokenizer {
  /**
   * Get a TikToken tokenizer for a specific model or encoding.
   */
  constructor(
    options: { model: TiktokenModel } | { encoding: TiktokenEncoding }
  ) {
    this.tiktoken =
      "model" in options
        ? encodingForModel(options.model)
        : getEncoding(options.encoding);
  }

  private readonly tiktoken: Tiktoken;

  async countTokens(text: string) {
    return this.tiktoken.encode(text).length;
  }

  async tokenize(text: string) {
    return this.tiktoken.encode(text);
  }

  async tokenizeWithTexts(text: string) {
    const tokens = this.tiktoken.encode(text);

    return {
      tokens,
      tokenTexts: tokens.map((token) => this.tiktoken.decode([token])),
    };
  }

  async detokenize(tokens: number[]) {
    return this.tiktoken.decode(tokens);
  }
}
