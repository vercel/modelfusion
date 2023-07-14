import { FunctionOptions } from "model/FunctionOptions.js";
import { TextChunk } from "../TextChunk.js";
import {
  TextChunkRetriever,
  TextChunkRetrieverSettings,
} from "./TextChunkRetriever.js";

export async function retrieveSimilarTextChunks<
  CHUNK extends TextChunk,
  SETTINGS extends TextChunkRetrieverSettings
>(
  retriever: TextChunkRetriever<CHUNK, SETTINGS>,
  queryText: string,
  options?: FunctionOptions<SETTINGS>
): Promise<CHUNK[]> {
  // TODO add error handling, events, duration tracking, etc.
  return retriever.retrieveSimilarTextChunks(queryText, options);
}

export function retrieveSimilarTextChunksAsFunction<
  CHUNK extends TextChunk,
  SETTINGS extends TextChunkRetrieverSettings
>(
  retriever: TextChunkRetriever<CHUNK, SETTINGS>,
  generateOptions?: FunctionOptions<SETTINGS>
) {
  return async (queryText: string, options?: FunctionOptions<SETTINGS>) => {
    return retrieveSimilarTextChunks(retriever, queryText, {
      functionId: options?.functionId ?? generateOptions?.functionId,
      settings: Object.assign({}, generateOptions?.settings, options?.settings),
      run: options?.run,
    });
  };
}
