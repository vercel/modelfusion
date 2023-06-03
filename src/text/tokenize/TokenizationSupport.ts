import { Tokenizer } from "./Tokenizer.js";

export type TokenizationSupport = {
  readonly maxTokens: number;
  readonly tokenizer: Tokenizer;
};
