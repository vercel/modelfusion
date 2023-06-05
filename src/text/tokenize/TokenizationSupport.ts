import { Tokenizer } from "./Tokenizer.js";

export interface TokenizationSupport {
  readonly maxTokens: number;
  readonly tokenizer: Tokenizer;
}
