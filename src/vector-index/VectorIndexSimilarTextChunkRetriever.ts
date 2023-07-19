import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { TextEmbeddingModel } from "../model-function/embed-text/TextEmbeddingModel.js";
import { embedText } from "../model-function/embed-text/embedText.js";
import { TextChunk } from "../text-chunk/TextChunk.js";
import {
  TextChunkRetriever,
  TextChunkRetrieverSettings,
} from "../text-chunk/retrieve-text-chunks/TextChunkRetriever.js";
import { VectorIndex } from "./VectorIndex.js";

export interface VectorIndexTextChunkRetrieverSettings {
  maxResults?: number;
  similarityThreshold?: number;
}

export class VectorIndexSimilarTextChunkRetriever<
  CHUNK extends TextChunk,
  INDEX
> implements
    TextChunkRetriever<CHUNK, string, VectorIndexTextChunkRetrieverSettings>
{
  private readonly vectorIndex: VectorIndex<CHUNK, INDEX>;
  private readonly embeddingModel: TextEmbeddingModel<any, any>;
  private readonly settings: VectorIndexTextChunkRetrieverSettings;

  constructor({
    vectorIndex,
    embeddingModel,
    maxResults,
    similarityThreshold,
  }: {
    vectorIndex: VectorIndex<CHUNK, INDEX>;
    embeddingModel: TextEmbeddingModel<any, any>;
  } & VectorIndexTextChunkRetrieverSettings) {
    this.vectorIndex = vectorIndex;
    this.embeddingModel = embeddingModel;
    this.settings = {
      maxResults,
      similarityThreshold,
    };
  }

  async retrieveTextChunks(
    query: string,
    options?: FunctionOptions<TextChunkRetrieverSettings>
  ): Promise<CHUNK[]> {
    if (options?.settings != null) {
      return this.withSettings(options.settings).retrieveTextChunks(query, {
        functionId: options.functionId,
        run: options.run,
      });
    }

    const queryResult = await this.vectorIndex.queryByVector({
      queryVector: await embedText(this.embeddingModel, query, {
        functionId: options?.functionId,
        run: options?.run,
      }),
      maxResults: this.settings.maxResults ?? 1,
      similarityThreshold: this.settings.similarityThreshold,
    });

    return queryResult.map((item) => item.data);
  }

  withSettings(
    additionalSettings: Partial<VectorIndexTextChunkRetrieverSettings>
  ): this {
    return new VectorIndexSimilarTextChunkRetriever(
      Object.assign({}, this.settings, additionalSettings, {
        vectorIndex: this.vectorIndex,
        embeddingModel: this.embeddingModel,
      })
    ) as this;
  }
}
