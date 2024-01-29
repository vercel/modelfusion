import { FunctionOptions } from "../core/FunctionOptions";
import { embed } from "../model-function/embed/embed";
import {
  EmbeddingModel,
  EmbeddingModelSettings,
} from "../model-function/embed/EmbeddingModel";
import { Retriever } from "../retriever/Retriever";
import { VectorIndex } from "./VectorIndex";

export interface VectorIndexRetrieverSettings<FILTER> {
  maxResults?: number;
  similarityThreshold?: number;
  filter?: FILTER;
}

export class VectorIndexRetriever<OBJECT, VALUE, INDEX, FILTER>
  implements Retriever<OBJECT, VALUE>
{
  private readonly vectorIndex: VectorIndex<OBJECT, INDEX, FILTER>;
  private readonly embeddingModel: EmbeddingModel<
    VALUE,
    EmbeddingModelSettings
  >;
  private readonly settings: VectorIndexRetrieverSettings<FILTER>;

  constructor({
    vectorIndex,
    embeddingModel,
    maxResults,
    similarityThreshold,
    filter,
  }: {
    vectorIndex: VectorIndex<OBJECT, INDEX, FILTER>;
    embeddingModel: EmbeddingModel<VALUE, EmbeddingModelSettings>;
  } & VectorIndexRetrieverSettings<FILTER>) {
    this.vectorIndex = vectorIndex;
    this.embeddingModel = embeddingModel;
    this.settings = {
      maxResults,
      similarityThreshold,
      filter,
    };
  }

  async retrieve(query: VALUE, options?: FunctionOptions): Promise<OBJECT[]> {
    const embedding = await embed({
      model: this.embeddingModel,
      value: query,
      ...options,
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
