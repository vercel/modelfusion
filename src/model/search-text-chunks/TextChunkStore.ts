import { FunctionOptions } from "index.js";
import { TextChunk } from "./TextChunk.js";

export interface TextChunkStoreSettings {}

export interface TextChunkStore<METADATA> {
  searchTextChunks(
    query: string,
    options?: FunctionOptions<TextChunkStoreSettings>
  ): Promise<TextChunk<METADATA>[]>;
}
