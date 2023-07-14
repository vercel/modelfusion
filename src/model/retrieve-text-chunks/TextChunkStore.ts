import { FunctionOptions } from "index.js";
import { TextChunk } from "./TextChunk.js";

export interface TextChunkStoreSettings {}

export interface TextChunkStore<CHUNK extends TextChunk> {
  retrieveSimilarTextChunks(
    queryText: string,
    options?: FunctionOptions<TextChunkStoreSettings>
  ): Promise<CHUNK[]>;
}
