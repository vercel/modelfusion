import {
  getEncoding,
  encodingForModel,
  TiktokenModel,
  TiktokenEncoding,
  Tiktoken,
} from "js-tiktoken";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";

/**
 * TikToken tokenizer for OpenAI language models.
 *
 * @see https://github.com/openai/tiktoken
 *
 * @example
 * const tokenizer = TikTokenTokenizer.forModel({ model: "gpt-4" });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * console.log("countTokens", await tokenizer.countTokens(text));
 * console.log("tokenize", await tokenizer.tokenize(text));
 * console.log("tokenizeWithTexts", await tokenizer.tokenizeWithTexts(text));
 * console.log("detokenize(tokenize)", await tokenizer.detokenize(await tokenizer.tokenize(text)));
 */
export class TikTokenTokenizer implements Tokenizer<number> {
  /**
   * Get a TikToken tokenizer for a specific model.
   */
  static forModel({ model }: { model: TiktokenModel }): Tokenizer<number> {
    return new TikTokenTokenizer({ tiktoken: encodingForModel(model) });
  }

  /**
   * Get a TikToken tokenizer for a specific encoding.
   */
  static forEncoding({
    encoding,
  }: {
    encoding: TiktokenEncoding;
  }): Tokenizer<number> {
    return new TikTokenTokenizer({ tiktoken: getEncoding(encoding) });
  }

  private readonly tiktoken: Tiktoken;

  private constructor({ tiktoken }: { tiktoken: Tiktoken }) {
    this.tiktoken = tiktoken;
  }

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
