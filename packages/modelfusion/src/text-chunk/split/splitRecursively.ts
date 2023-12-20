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

/**
 * Splits text recursively until the resulting chunks are smaller than the `maxCharactersPerChunk`.
 * The text is recursively split in the middle, so that all chunks are roughtly the same size.
 */
export const splitAtCharacter =
  ({
    maxCharactersPerChunk,
  }: {
    maxCharactersPerChunk: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursively({
      maxChunkSize: maxCharactersPerChunk,
      segments: text,
    });

/**
 * Splits text recursively until the resulting chunks are smaller than the `maxTokensPerChunk`,
 * while respecting the token boundaries.
 * The text is recursively split in the middle, so that all chunks are roughtly the same size.
 */
export const splitAtToken =
  ({
    tokenizer,
    maxTokensPerChunk,
  }: {
    tokenizer: FullTokenizer;
    maxTokensPerChunk: number;
  }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursively({
      maxChunkSize: maxTokensPerChunk,
      segments: (await tokenizer.tokenizeWithTexts(text)).tokenTexts,
    });
