import { FunctionOptions } from "model/FunctionOptions.js";
import { TextChunk } from "../TextChunk.js";
import {
  TextChunkRetriever,
  TextChunkRetrieverSettings,
} from "./TextChunkRetriever.js";

export async function retrieveTextChunks<
  CHUNK extends TextChunk,
  QUERY,
  SETTINGS extends TextChunkRetrieverSettings
>(
  retriever: TextChunkRetriever<CHUNK, QUERY, SETTINGS>,
  query: QUERY,
  options?: FunctionOptions<SETTINGS>
): Promise<CHUNK[]> {
  // TODO add error handling, events, duration tracking, etc.
  return retriever.retrieveTextChunks(query, options);
}

export function retrieveTextChunksAsFunction<
  CHUNK extends TextChunk,
  QUERY,
  SETTINGS extends TextChunkRetrieverSettings
>(
  retriever: TextChunkRetriever<CHUNK, QUERY, SETTINGS>,
  generateOptions?: FunctionOptions<SETTINGS>
) {
  return async (query: QUERY, options?: FunctionOptions<SETTINGS>) => {
    return retrieveTextChunks(retriever, query, {
      functionId: options?.functionId ?? generateOptions?.functionId,
      settings: Object.assign({}, generateOptions?.settings, options?.settings),
      run: options?.run,
    });
  };
}
