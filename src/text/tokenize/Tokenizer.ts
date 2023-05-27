export type Tokenizer<TOKENS_TYPE> = {
  countTokens: (text: string) => PromiseLike<number>;
  encode: (text: string) => PromiseLike<TOKENS_TYPE>;
  encodeWithTexts: (text: string) => PromiseLike<{
    tokens: TOKENS_TYPE;
    tokenTexts: Array<string>;
  }>;
  decode: (tokens: TOKENS_TYPE) => PromiseLike<string>;
};
