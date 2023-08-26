import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../model-function/embed-text/TextEmbeddingModel.js";
import { embedText } from "../model-function/embed-text/embedText.js";
import { TextChunk } from "./TextChunk.js";
import {
  TextChunkRetriever,
  TextChunkRetrieverSettings,
} from "./retrieve-text-chunks/TextChunkRetriever.js";
import { VectorIndex } from "../vector-index/VectorIndex.js";

export interface SimilarTextChunksFromVectorIndexRetrieverSettings {
  maxResults?: number;
  similarityThreshold?: number;
}

export class SimilarTextChunksFromVectorIndexRetriever<
  CHUNK extends TextChunk,
  INDEX,
  SETTINGS extends TextEmbeddingModelSettings,
> implements
    TextChunkRetriever<
      CHUNK,
      string,
      SimilarTextChunksFromVectorIndexRetrieverSettings
    >
{
  private readonly vectorIndex: VectorIndex<CHUNK, INDEX>;
  private readonly embeddingModel: TextEmbeddingModel<unknown, SETTINGS>;
  private readonly settings: SimilarTextChunksFromVectorIndexRetrieverSettings;

  constructor({
    vectorIndex,
    embeddingModel,
    maxResults,
    similarityThreshold,
  }: {
    vectorIndex: VectorIndex<CHUNK, INDEX>;
    embeddingModel: TextEmbeddingModel<unknown, SETTINGS>;
  } & SimilarTextChunksFromVectorIndexRetrieverSettings) {
    this.vectorIndex = vectorIndex;
    this.embeddingModel = embeddingModel;
    this.settings = {
      maxResults,
      similarityThreshold,
    };
  }

  async retrieveTextChunks(
    query: string,
    options?: ModelFunctionOptions<TextChunkRetrieverSettings>
  ): Promise<CHUNK[]> {
    if (options?.settings != null) {
      return this.withSettings(options.settings).retrieveTextChunks(query, {
        functionId: options.functionId,
        observers: options.observers,
        run: options.run,
      });
    }

    const embedding = await embedText(this.embeddingModel, query, {
      functionId: options?.functionId,
      run: options?.run,
    });

    const queryResult = await this.vectorIndex.queryByVector({
      queryVector: embedding,
      maxResults: this.settings.maxResults ?? 1,
      similarityThreshold: this.settings.similarityThreshold,
    });

    return queryResult.map((item) => item.data);
  }

  withSettings(
    additionalSettings: Partial<SimilarTextChunksFromVectorIndexRetrieverSettings>
  ): this {
    return new SimilarTextChunksFromVectorIndexRetriever(
      Object.assign({}, this.settings, additionalSettings, {
        vectorIndex: this.vectorIndex,
        embeddingModel: this.embeddingModel,
      })
    ) as this;
  }
}
