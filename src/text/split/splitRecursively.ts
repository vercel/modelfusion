import { TokenizationSupport } from "../../model/tokenization/TokenizationSupport.js";
import { Tokenizer } from "../../model/tokenization/Tokenizer.js";
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

export const splitRecursivelyAtCharacterAsSplitFunction =
  ({ maxChunkSize }: { maxChunkSize: number }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtCharacter({ maxChunkSize, text });

export const splitRecursivelyAtToken = async ({
  tokenizer,
  maxChunkSize,
  text,
}: {
  tokenizer: Tokenizer;
  maxChunkSize: number;
  text: string;
}) =>
  splitRecursively({
    maxChunkSize,
    segments: (await tokenizer.tokenizeWithTexts(text)).tokenTexts,
  });

splitRecursivelyAtToken.asSplitFunction =
  ({
    tokenizer,
    maxChunkSize,
  }: {
    tokenizer: Tokenizer;
    maxChunkSize: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtToken({
      tokenizer,
      maxChunkSize,
      text,
    });

export const splitRecursivelyAtTokenForModel = async ({
  model,
  maxChunkSize,
  text,
}: {
  model: TokenizationSupport;
  maxChunkSize: number;
  text: string;
}) => {
  return splitRecursively({
    maxChunkSize,
    segments: (await model.tokenizer.tokenizeWithTexts(text)).tokenTexts,
  });
};

export const splitRecursivelyAtTokenForModelAsSplitFunction =
  ({
    model,
    maxChunkSize,
  }: {
    model: TokenizationSupport;
    maxChunkSize: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtTokenForModel({
      model,
      maxChunkSize,
      text,
    });
