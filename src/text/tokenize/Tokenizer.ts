export type Tokenizer<TOKEN_TYPE> = {
  countTokens: (text: string) => PromiseLike<number>;
  tokenize: (text: string) => PromiseLike<Array<TOKEN_TYPE>>;
  tokenizeWithTexts: (text: string) => PromiseLike<{
    tokens: Array<TOKEN_TYPE>;
    tokenTexts: Array<string>;
  }>;
  detokenize: (tokens: Array<TOKEN_TYPE>) => PromiseLike<string>;
};
