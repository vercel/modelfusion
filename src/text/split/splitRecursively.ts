import { Tokenizer } from "../tokenize/Tokenizer.js";
import { TokenizerModel } from "../tokenize/TokenizerModel.js";
import { SplitFunction } from "./SplitFunction.js";

// when segments is a string, it splits by character, otherwise according to the provided segments
export function splitRecursively({
  maxChunkSize,
  segments,
}: {
  maxChunkSize: number;
  segments: string | Array<string>;
}): Array<string> {
  if (segments.length < maxChunkSize) {
    return Array.isArray(segments) ? [segments.join("")] : [segments];
  }

  const half = Math.ceil(segments.length / 2);
  const left = segments.slice(0, half);
  const right = segments.slice(half);

  return [
    ...splitRecursively({
      segments: left,
      maxChunkSize,
    }),
    ...splitRecursively({
      segments: right,
      maxChunkSize,
    }),
  ];
}

export const splitRecursivelyAtCharacter = async ({
  maxChunkSize,
  text,
}: {
  maxChunkSize: number;
  text: string;
}) =>
  splitRecursively({
    maxChunkSize,
    segments: text,
  });

splitRecursivelyAtCharacter.asSplitFunction =
  ({ maxChunkSize }: { maxChunkSize: number }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtCharacter({ maxChunkSize, text });

export const splitRecursivelyAtToken = async <T>({
  tokenizer,
  maxChunkSize,
  text,
}: {
  tokenizer: Tokenizer<T>;
  maxChunkSize: number;
  text: string;
}) =>
  splitRecursively({
    maxChunkSize,
    segments: (await tokenizer.encodeWithTexts(text)).tokenTexts,
  });

splitRecursivelyAtToken.asSplitFunction =
  <T>({
    tokenizer,
    maxChunkSize,
  }: {
    tokenizer: Tokenizer<T>;
    maxChunkSize: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtToken({
      tokenizer,
      maxChunkSize,
      text,
    });

export const splitRecursivelyAtTokenForModel = async <T>({
  model,
  maxChunkSize,
  text,
}: {
  model: TokenizerModel<T>;
  maxChunkSize: number;
  text: string;
}) => {
  return splitRecursively({
    maxChunkSize,
    segments: (await model.tokenizer.encodeWithTexts(text)).tokenTexts,
  });
};

splitRecursivelyAtTokenForModel.asSplitFunction =
  <T>({
    model,
    maxChunkSize,
  }: {
    model: TokenizerModel<T>;
    maxChunkSize: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtTokenForModel({
      model,
      maxChunkSize,
      text,
    });
