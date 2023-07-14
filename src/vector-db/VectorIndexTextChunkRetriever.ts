import { FunctionOptions } from "index.js";
import { TextEmbeddingModel } from "../model/embed-text/TextEmbeddingModel.js";
import { embedText } from "../model/embed-text/embedText.js";
import { TextChunk } from "../model/retrieve-text-chunks/TextChunk.js";
import {
  TextChunkRetriever,
  TextChunkRetrieverSettings,
} from "../model/retrieve-text-chunks/TextChunkRetriever.js";
import { VectorIndex } from "./VectorIndex.js";

export interface VectorIndexTextChunkRetrieverSettings {
  maxResults?: number;
  similarityThreshold?: number;
}

export class VectorIndexTextChunkRetriever<CHUNK extends TextChunk, INDEX>
  implements TextChunkRetriever<CHUNK, VectorIndexTextChunkRetrieverSettings>
{
  private readonly index: VectorIndex<CHUNK, INDEX>;
  private readonly embeddingModel: TextEmbeddingModel<any, any>;
  private readonly settings: VectorIndexTextChunkRetrieverSettings;

  constructor(
    {
      index,
      embeddingModel,
    }: {
      index: VectorIndex<CHUNK, INDEX>;
      embeddingModel: TextEmbeddingModel<any, any>;
    },
    settings: VectorIndexTextChunkRetrieverSettings = {}
  ) {
    this.index = index;
    this.embeddingModel = embeddingModel;
    this.settings = settings;
  }

  async retrieveSimilarTextChunks(
    queryText: string,
    options?: FunctionOptions<TextChunkRetrieverSettings>
  ): Promise<CHUNK[]> {
    if (options?.settings != null) {
      return this.withSettings(options.settings).retrieveSimilarTextChunks(
        queryText,
        { functionId: options.functionId, run: options.run }
      );
    }

    const queryResult = await this.index.queryByVector({
      queryVector: await embedText(this.embeddingModel, queryText, {
        functionId: options?.functionId,
        run: options?.run,
      }),
      maxResults: 1,
      similarityThreshold: undefined,
    });

    return queryResult.map((item) => item.data);
  }

  withSettings(
    additionalSettings: Partial<VectorIndexTextChunkRetrieverSettings>
  ): this {
    return new VectorIndexTextChunkRetriever(
      { index: this.index, embeddingModel: this.embeddingModel },
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
