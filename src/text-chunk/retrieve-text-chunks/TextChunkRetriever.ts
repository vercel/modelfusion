import { FunctionOptions } from "../../model/FunctionOptions.js";
import { TextChunk } from "../TextChunk.js";

export interface TextChunkRetrieverSettings {}

export interface TextChunkRetriever<
  CHUNK extends TextChunk,
  QUERY,
  SETTINGS extends TextChunkRetrieverSettings
> {
  retrieveTextChunks(
    query: QUERY,
    options?: FunctionOptions<TextChunkRetrieverSettings>
  ): Promise<CHUNK[]>;

  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
