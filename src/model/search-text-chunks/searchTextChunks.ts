import { FunctionOptions } from "model/FunctionOptions.js";
import { TextChunk } from "./TextChunk.js";
import { TextChunkStore, TextChunkStoreSettings } from "./TextChunkStore.js";

export async function searchTextChunks<
  METADATA,
  SETTINGS extends TextChunkStoreSettings
>(
  store: TextChunkStore<METADATA>,
  query: string,
  options?: FunctionOptions<SETTINGS>
): Promise<TextChunk<METADATA>[]> {
  // TODO add error handling, events, duration tracking, etc.
  return store.searchTextChunks(query, options);
}
