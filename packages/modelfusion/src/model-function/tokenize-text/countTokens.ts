import { BasicTokenizer } from "./Tokenizer";

/**
 * Count the number of tokens in the given text.
 */
export async function countTokens(tokenizer: BasicTokenizer, text: string) {
  return (await tokenizer.tokenize(text)).length;
}
