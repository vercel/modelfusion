export interface Tokenizer {
  /**
   * Count the number of tokens in the given text.
   */
  countTokens: (text: string) => PromiseLike<number>;

  /**
   * Get the tokens that represent the given text.
   */
  tokenize: (text: string) => PromiseLike<Array<number>>;

  /**
   * Get the tokens that represent the given text and the text for each token.
   */
  tokenizeWithTexts: (text: string) => PromiseLike<{
    tokens: Array<number>;
    tokenTexts: Array<string>;
  }>;

  /**
   * Get the text that represents the given tokens.
   */
  detokenize: (tokens: Array<number>) => PromiseLike<string>;
}
