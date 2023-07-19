import { FunctionOptions } from "../../model-function/FunctionOptions.js";
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
