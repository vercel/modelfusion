import { Tokenizer } from "./Tokenizer.js";

export type TokenizerModel<TOKENS_TYPE> = {
  readonly tokenizer: Tokenizer<TOKENS_TYPE>;
};
