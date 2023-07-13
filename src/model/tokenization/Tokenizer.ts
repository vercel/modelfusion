export interface BasicTokenizer {
  /**
   * Get the tokens that represent the given text.
   */
  tokenize: (text: string) => PromiseLike<Array<number>>;
}

export interface FullTokenizer extends BasicTokenizer {
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
