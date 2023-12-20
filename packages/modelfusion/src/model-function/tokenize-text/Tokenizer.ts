/**
 * Interface for a basic tokenizer capable of converting text into tokens.
 *
 * This serves as the base for tokenization functionalities where the focus is on the transformation of input text into a series of numeric tokens.
 */
export interface BasicTokenizer {
  /**
   * Asynchronously tokenize the given text into a sequence of numeric tokens.
   *
   * @param text - Input text string that needs to be tokenized.
   * @returns A promise containing an array of numbers, where each number is a token representing a part or the whole of the input text.
   */
  tokenize: (text: string) => PromiseLike<Array<number>>;
}

/**
 * Interface for a comprehensive tokenizer that extends the basic tokenization capabilities.
 *
 * In addition to basic tokenization, this interface provides methods for detokenization and
 * retrieving the original text corresponding to each token, enabling a more informative and reversible transformation process.
 */
export interface FullTokenizer extends BasicTokenizer {
  /**
   * Asynchronously tokenize the given text, providing both the numeric tokens and their corresponding text.
   *
   * @param text - Input text string to be tokenized.
   * @returns A promise containing an object with two arrays:
   *          1. `tokens` - An array of numbers where each number is a token.
   *          2. `tokenTexts` - An array of strings where each string represents the original text corresponding to each token.
   */
  tokenizeWithTexts: (text: string) => PromiseLike<{
    tokens: Array<number>;
    tokenTexts: Array<string>;
  }>;

  /**
   * Asynchronously revert a sequence of numeric tokens back into the original text.
   * Detokenization is the process of transforming tokens back to a human-readable format, and it's essential in scenarios
   * where the output needs to be interpretable or when the tokenization process has to be reversible.
   *
   * @param tokens - An array of numeric tokens to be converted back to text.
   * @returns A promise containing a string that represents the original text corresponding to the sequence of input tokens.
   */
  detokenize: (tokens: Array<number>) => PromiseLike<string>;
}
