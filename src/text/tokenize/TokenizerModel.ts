import { Tokenizer } from "./Tokenizer.js";

export type TokenizerModel<TOKENS_TYPE> = {
  getTokenizer(): Tokenizer<TOKENS_TYPE>;
};
