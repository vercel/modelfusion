import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import { TextChunk } from "../TextChunk.js";

export interface TextChunkRetrieverSettings {}

export interface TextChunkRetriever<
  CHUNK extends TextChunk,
  QUERY,
  SETTINGS extends TextChunkRetrieverSettings,
> {
  retrieveTextChunks(
    query: QUERY,
    options?: ModelFunctionOptions<TextChunkRetrieverSettings>
  ): Promise<CHUNK[]>;

  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
