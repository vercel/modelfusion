import { FunctionOptions } from "model/FunctionOptions.js";
import { TextChunk } from "./TextChunk.js";
import { TextChunkStore, TextChunkStoreSettings } from "./TextChunkStore.js";

export async function retrieveSimilarTextChunks<
  CHUNK extends TextChunk,
  SETTINGS extends TextChunkStoreSettings
>(
  store: TextChunkStore<CHUNK>,
  query: string,
  options?: FunctionOptions<SETTINGS>
): Promise<CHUNK[]> {
  // TODO add error handling, events, duration tracking, etc.
  return store.retrieveSimilarTextChunks(query, options);
}
