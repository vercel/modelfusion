import { SplitFunction } from "./SplitFunction.js";

function splitRecursivelyImplementation({
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
    ...splitRecursivelyImplementation({
      segments: left,
      maxChunkSize,
    }),
    ...splitRecursivelyImplementation({
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
  splitRecursivelyImplementation({
    maxChunkSize,
    segments: text,
  });

splitRecursivelyAtCharacter.asSplitFunction =
  ({ maxChunkSize }: { maxChunkSize: number }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitRecursivelyAtCharacter({ maxChunkSize, text });
