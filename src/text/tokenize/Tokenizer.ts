export type Tokenizer<TOKENS_TYPE> = {
  countTokens: (text: string) => PromiseLike<number>;
  tokenize: (text: string) => PromiseLike<TOKENS_TYPE>;
  tokenizeWithTexts: (text: string) => PromiseLike<{
    tokens: TOKENS_TYPE;
    tokenTexts: Array<string>;
  }>;
  detokenize: (tokens: TOKENS_TYPE) => PromiseLike<string>;
};
