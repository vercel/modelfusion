export interface Tokenizer {
  countTokens: (text: string) => PromiseLike<number>;
  tokenize: (text: string) => PromiseLike<Array<number>>;
  tokenizeWithTexts: (text: string) => PromiseLike<{
    tokens: Array<number>;
    tokenTexts: Array<string>;
  }>;
  detokenize: (tokens: Array<number>) => PromiseLike<string>;
}
