import { nanoid as createId } from "nanoid";
import { TextEmbeddingModel } from "../model/text-embedding/TextEmbeddingModel.js";
import { RunContext } from "../run/RunContext.js";
import { Vector } from "../run/Vector.js";
import { VectorStore } from "./VectorStore.js";

export type VectorDBQueryResult<DATA> = Array<{
  id: string;
  data: DATA;
  similarity?: number;
}>;

export class VectorDB<DATA, STORE> {
  private readonly _store: VectorStore<DATA, STORE>;

  private readonly generateId: () => string;

  private readonly embeddingModel: TextEmbeddingModel<any>;
  private readonly queryFunctionId?: string;
  private readonly storeFunctionId?: string;

  constructor({
    store,
    generateId = createId,
    embeddingModel,
    queryFunctionId,
    storeFunctionId,
  }: {
    store: VectorStore<DATA, STORE>;
    generateId?: () => string;
    embeddingModel: TextEmbeddingModel<any>;
    queryFunctionId?: string;
    storeFunctionId?: string;
  }) {
    this._store = store;
    this.generateId = generateId;
    this.embeddingModel = embeddingModel;
    this.queryFunctionId = queryFunctionId;
    this.storeFunctionId = storeFunctionId;
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
    this.upsertMany(
      {
        ids: [id],
        keyTexts: [keyText],
        data: [data],
      },
      context
    );
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

    const vectors = await this.embeddingModel.embedTexts(
      keyTexts,
      { functionId: this.storeFunctionId },
      context
    );

    this._store.upsertMany(
      vectors.map((vector, i) => ({
        id: ids?.[i] ?? this.generateId(),
        vector,
        data: data[i],
      }))
    );
  }

  async queryByText(
    {
      queryText,
      maxResults,
      similarityThreshold,
    }: {
      queryText: string;
      maxResults?: number;
      similarityThreshold?: number;
    },
    context?: RunContext
  ): Promise<VectorDBQueryResult<DATA>> {
    return this.queryByVector({
      queryVector: await this.embeddingModel.embedText(
        queryText,
        { functionId: this.queryFunctionId },
        context
      ),
      maxResults,
      similarityThreshold,
    });
  }

  async queryByVector({
    queryVector,
    maxResults = 1,
    similarityThreshold,
  }: {
    queryVector: Vector;
    maxResults?: number;
    similarityThreshold?: number;
  }): Promise<VectorDBQueryResult<DATA>> {
    return this._store.query({
      queryVector,
      maxResults,
      similarityThreshold,
    });
  }

  get store(): STORE {
    return this._store.asStore();
  }
}
