import {
  getEncoding,
  encodingForModel,
  TiktokenModel,
  TiktokenEncoding,
  Tiktoken,
} from "js-tiktoken";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";

/**
 * Get a TikToken tokenizer for an OpenAI model.
 *
 * @see https://github.com/openai/tiktoken
 *
 * @example
 * const tokenizer = getTiktokenTokenizerForModel({
 *   model: "gpt-4",
 * });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * console.log("countTokens", await tokenizer.countTokens(text));
 * console.log("encode", await tokenizer.encode(text));
 * console.log("encodeWithTexts", await tokenizer.encodeWithTexts(text));
 * console.log(
 *   "decode(encode)",
 *   await tokenizer.decode(await tokenizer.encode(text))
 * );
 */
export function getTiktokenTokenizerForModel({
  model,
}: {
  model: TiktokenModel;
}): Tokenizer<number[]> {
  return getTiktokenTokenizerForEncoder({
    encoder: () => encodingForModel(model),
  });
}

/**
 * Get a TikToken tokenizer for a specific encoding.
 *
 * @see https://github.com/openai/tiktoken
 */
export function getTiktokenTokenizerForEncoding({
  encoding,
}: {
  encoding: TiktokenEncoding;
}): Tokenizer<number[]> {
  return getTiktokenTokenizerForEncoder({
    encoder: () => getEncoding(encoding),
  });
}

function getTiktokenTokenizerForEncoder({
  encoder: createEncoder,
}: {
  encoder: () => Tiktoken;
}): Tokenizer<number[]> {
  const encoder = createEncoder();

  return {
    countTokens: async (text: string) => {
      return encoder.encode(text).length;
    },

    tokenize: async (text: string) => {
      return encoder.encode(text);
    },

    tokenizeWithTexts: async (text: string) => {
      const tokens = encoder.encode(text);

      return {
        tokens,
        tokenTexts: tokens.map((token) => encoder.decode([token])),
      };
    },

    detokenize: async (tokens: number[]) => {
      return encoder.decode(tokens);
    },
  };
}
