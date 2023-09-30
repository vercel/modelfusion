import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../model-function/embed-text/TextEmbeddingModel.js";
import { embedText } from "../model-function/embed-text/embedText.js";
import { Retriever, RetrieverSettings } from "../retriever/Retriever.js";
import { VectorIndex } from "./VectorIndex.js";

export interface VectorIndexRetrieverSettings<FILTER> {
  maxResults?: number;
  similarityThreshold?: number;
  filter?: FILTER;
}

export class VectorIndexRetriever<OBJECT, INDEX, FILTER>
  implements Retriever<OBJECT, string, VectorIndexRetrieverSettings<FILTER>>
{
  private readonly vectorIndex: VectorIndex<OBJECT, INDEX, FILTER>;
  private readonly embeddingModel: TextEmbeddingModel<
    unknown,
    TextEmbeddingModelSettings
  >;
  private readonly settings: VectorIndexRetrieverSettings<FILTER>;

  constructor({
    vectorIndex,
    embeddingModel,
    maxResults,
    similarityThreshold,
  }: {
    vectorIndex: VectorIndex<OBJECT, INDEX, FILTER>;
    embeddingModel: TextEmbeddingModel<unknown, TextEmbeddingModelSettings>;
  } & VectorIndexRetrieverSettings<FILTER>) {
    this.vectorIndex = vectorIndex;
    this.embeddingModel = embeddingModel;
    this.settings = {
      maxResults,
      similarityThreshold,
    };
  }

  async retrieve(
    query: string,
    options?: ModelFunctionOptions<RetrieverSettings>
  ): Promise<OBJECT[]> {
    if (options?.settings != null) {
      return this.withSettings(options.settings).retrieve(query, {
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
      filter: this.settings?.filter,
    });

    return queryResult.map((item) => item.data);
  }

  withSettings(
    additionalSettings: Partial<VectorIndexRetrieverSettings<FILTER>>
  ): this {
    return new VectorIndexRetriever(
      Object.assign({}, this.settings, additionalSettings, {
        vectorIndex: this.vectorIndex,
        embeddingModel: this.embeddingModel,
      })
    ) as this;
  }
}
