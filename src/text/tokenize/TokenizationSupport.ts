import { Tokenizer } from "./Tokenizer.js";

export type TokenizationSupport<INPUT, TOKEN_TYPE> = {
  readonly maxTokens: number;
  readonly tokenizer: Tokenizer<TOKEN_TYPE>;

  countTokens(input: INPUT): PromiseLike<number>;
};
