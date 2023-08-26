import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import { TextChunk } from "../TextChunk.js";
import {
  TextChunkRetriever,
  TextChunkRetrieverSettings,
} from "./TextChunkRetriever.js";

export async function retrieveTextChunks<
  CHUNK extends TextChunk,
  QUERY,
  SETTINGS extends TextChunkRetrieverSettings,
>(
  retriever: TextChunkRetriever<CHUNK, QUERY, SETTINGS>,
  query: QUERY,
  options?: ModelFunctionOptions<SETTINGS>
): Promise<{
  chunks: CHUNK[];
}> {
  // TODO add error handling, events, duration tracking, etc.
  return {
    chunks: await retriever.retrieveTextChunks(query, options),
  };
}
