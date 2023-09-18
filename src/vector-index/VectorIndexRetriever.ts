import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../model-function/embed-text/TextEmbeddingModel.js";
import { embedText } from "../model-function/embed-text/embedText.js";
import { Retriever, RetrieverSettings } from "../retriever/Retriever.js";
import { VectorIndex } from "./VectorIndex.js";

export interface VectorIndexRetrieverSettings {
  maxResults?: number;
  similarityThreshold?: number;
}

export class VectorIndexRetriever<
  OBJECT,
  INDEX,
  SETTINGS extends TextEmbeddingModelSettings,
> implements Retriever<OBJECT, string, VectorIndexRetrieverSettings>
{
  private readonly vectorIndex: VectorIndex<OBJECT, INDEX>;
  private readonly embeddingModel: TextEmbeddingModel<unknown, SETTINGS>;
  private readonly settings: VectorIndexRetrieverSettings;

  constructor({
    vectorIndex,
    embeddingModel,
    maxResults,
    similarityThreshold,
  }: {
    vectorIndex: VectorIndex<OBJECT, INDEX>;
    embeddingModel: TextEmbeddingModel<unknown, SETTINGS>;
  } & VectorIndexRetrieverSettings) {
    this.vectorIndex = vectorIndex;
    this.embeddingModel = embeddingModel;
    this.settings = {
      maxResults,
      similarityThreshold,
    };
  }

  async retrieveObjects(
    query: string,
    options?: ModelFunctionOptions<RetrieverSettings>
  ): Promise<OBJECT[]> {
    if (options?.settings != null) {
      return this.withSettings(options.settings).retrieveObjects(query, {
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
    additionalSettings: Partial<VectorIndexRetrieverSettings>
  ): this {
    return new VectorIndexRetriever(
      Object.assign({}, this.settings, additionalSettings, {
        vectorIndex: this.vectorIndex,
        embeddingModel: this.embeddingModel,
      })
    ) as this;
  }
}
