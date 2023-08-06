import { TextChunk } from "../TextChunk.js";
import { SplitFunction } from "./SplitFunction.js";

export async function splitTextChunks<CHUNK extends TextChunk>(
  splitFunction: SplitFunction,
  inputs: CHUNK[]
): Promise<CHUNK[]> {
  const pageChunks = await Promise.all(
    inputs.map(async (input) => {
      const parts = await splitFunction(input);
      return parts.map((text) => ({
        ...input,
        text,
      }));
    })
  );

  return pageChunks.flat();
}
