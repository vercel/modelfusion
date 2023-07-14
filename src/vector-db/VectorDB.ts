import { nanoid as createId } from "nanoid";
import { TextEmbeddingModel } from "../model/embed-text/TextEmbeddingModel.js";
import { embedText, embedTexts } from "../model/embed-text/embedText.js";
import { Run } from "../run/Run.js";
import { Vector } from "../run/Vector.js";
import { VectorIndex } from "./VectorIndex.js";

export type VectorDBQueryResult<DATA> = Array<{
  id: string;
  data: DATA;
  similarity?: number;
}>;

export class VectorDB<DATA, INDEX> {
  private readonly _index: VectorIndex<DATA, INDEX>;

  private readonly generateId: () => string;

  private readonly embeddingModel: TextEmbeddingModel<any, any>;
  private readonly queryFunctionId?: string;
  private readonly upsertFunctionId?: string;

  constructor({
    index,
    generateId = createId,
    embeddingModel,
    queryFunctionId,
    upsertFunctionId,
  }: {
    index: VectorIndex<DATA, INDEX>;
    generateId?: () => string;
    embeddingModel: TextEmbeddingModel<any, any>;
    queryFunctionId?: string;
    upsertFunctionId?: string;
  }) {
    this._index = index;
    this.generateId = generateId;
    this.embeddingModel = embeddingModel;
    this.queryFunctionId = queryFunctionId;
    this.upsertFunctionId = upsertFunctionId;
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
    options?: { run?: Run }
  ): Promise<void> {
    this.upsertMany(
      {
        ids: [id],
        keyTexts: [keyText],
        data: [data],
      },
      options
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
    options?: { run?: Run }
  ) {
    if (keyTexts.length !== data.length) {
      throw new Error(
        "The number of key texts and data must be the same when storing many entries."
      );
    }

    const vectors = await embedTexts(this.embeddingModel, keyTexts, {
      functionId: this.upsertFunctionId,
      run: options?.run,
    });

    this._index.upsertMany(
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
    options?: { run?: Run }
  ): Promise<VectorDBQueryResult<DATA>> {
    return this.queryByVector({
      queryVector: await embedText(this.embeddingModel, queryText, {
        functionId: this.queryFunctionId,
        run: options?.run,
      }),
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
    return this._index.queryByVector({
      queryVector,
      maxResults,
      similarityThreshold,
    });
  }

  get index(): INDEX {
    return this._index.asIndex();
  }
}
