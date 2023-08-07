import { TextChunk } from "../TextChunk.js";
import { SplitFunction } from "./SplitFunction.js";

export async function splitTextChunks<CHUNK extends TextChunk>(
  splitFunction: SplitFunction,
  inputs: CHUNK[]
): Promise<CHUNK[]> {
  const pageChunks = await Promise.all(
    inputs.map((input) => splitTextChunk(splitFunction, input))
  );
  return pageChunks.flat();
}

export async function splitTextChunk<CHUNK extends TextChunk>(
  splitFunction: SplitFunction,
  input: CHUNK
): Promise<CHUNK[]> {
  const parts = await splitFunction(input);
  return parts.map((text) => ({
    ...input,
    text,
  }));
}
