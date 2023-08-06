import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { SplitFunction } from "./SplitFunction.js";

// when segments is a string, it splits by character, otherwise according to the provided segments
function splitRecursively({
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

export const splitRecursivelyAtCharacter =
  ({ maxChunkSize }: { maxChunkSize: number }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursively({
      maxChunkSize,
      segments: text,
    });

export const splitRecursivelyAtToken =
  ({
    tokenizer,
    maxChunkSize,
  }: {
    tokenizer: FullTokenizer;
    maxChunkSize: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursively({
      maxChunkSize,
      segments: (await tokenizer.tokenizeWithTexts(text)).tokenTexts,
    });
