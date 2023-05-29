import {
  getEncoding,
  encodingForModel,
  TiktokenModel,
  TiktokenEncoding,
  Tiktoken,
} from "js-tiktoken";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";

export function getTiktokenTokenizerForModel({
  model,
}: {
  model: TiktokenModel;
}): Tokenizer<number[]> {
  return getTiktokenTokenizerForEncoder({
    encoder: () => encodingForModel(model),
  });
}

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

    encode: async (text: string) => {
      return encoder.encode(text);
    },

    encodeWithTexts: async (text: string) => {
      const tokens = encoder.encode(text);

      return {
        tokens,
        tokenTexts: tokens.map((token) => encoder.decode([token])),
      };
    },

    decode: async (tokens: number[]) => {
      return encoder.decode(tokens);
    },
  };
}
