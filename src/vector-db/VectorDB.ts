import { createId } from "@paralleldrive/cuid2";
import { RunContext } from "../run/RunContext.js";
import { Vector } from "../run/Vector.js";
import {
  TextEmbeddingFunction,
  TextsEmbeddingFunction,
} from "../text/embed/TextEmbeddingFunction.js";
import { TextEmbeddingModel } from "../text/embed/TextEmbeddingModel.js";
import { embedText, embedTexts } from "../text/embed/embedText.js";
import { VectorStore } from "./VectorStore.js";

export type VectorDBQueryResult<DATA> = Array<{
  id: string;
  data: DATA;
  similarity: number;
}>;

export class VectorDB<DATA> {
  readonly store: VectorStore<DATA>;

  private readonly generateId: () => string;

  private readonly embedForStore: TextsEmbeddingFunction;
  private readonly embedForQuery: TextEmbeddingFunction;

  constructor({
    store,
    generateId = createId,
    embeddingModel,
    queryFunctionId,
    storeFunctionId,
  }: {
    store: VectorStore<DATA>;
    generateId?: () => string;
    embeddingModel: TextEmbeddingModel<any>;
    queryFunctionId?: string;
    storeFunctionId?: string;
  }) {
    this.store = store;
    this.generateId = generateId;
    this.embedForStore = embedTexts.asFunction({
      model: embeddingModel,
      functionId: storeFunctionId,
    });
    this.embedForQuery = embedText.asFunction({
      model: embeddingModel,
      functionId: queryFunctionId,
    });
  }

  async upsert(
    {
      id = this.generateId(),
      keyText,
      data,
    }: {
      id?: string;
      keyText: string;
      data: DATA;
    },
    context?: RunContext
  ): Promise<void> {
    this.store.upsert({
      id,
      vector: (await this.embedForStore([keyText], context))[0],
      data,
    });
  }

  async upsertMany(
    {
      ids,
      keyTexts,
      data,
    }: {
      ids?: Array<string | undefined>;
      keyTexts: Array<string>;
      data: DATA[];
    },
    context?: RunContext
  ) {
    if (keyTexts.length !== data.length) {
      throw new Error(
        "The number of key texts and data must be the same when storing many entries."
      );
    }

    const vectors = await this.embedForStore(keyTexts, context);
    for (let i = 0; i < vectors.length; i++) {
      this.store.upsert({
        id: ids?.[i] ?? this.generateId(),
        vector: vectors[i],
        data: data[i],
      });
    }
  }

  async queryByText(
    {
      queryText,
      maxResults,
      similarityThreshold,
    }: {
      queryText: string;
      maxResults?: number;
      similarityThreshold: number;
    },
    context?: RunContext
  ): Promise<VectorDBQueryResult<DATA>> {
    return this.queryByVector({
      queryVector: await this.embedForQuery(queryText, context),
      maxResults,
      similarityThreshold,
    });
  }

  async queryByVector(options: {
    queryVector: Vector;
    maxResults?: number;
    similarityThreshold: number;
  }): Promise<VectorDBQueryResult<DATA>> {
    return this.store.query(options);
  }
}
