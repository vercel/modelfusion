import { nanoid as createId } from "nanoid";
import { TextEmbeddingModel } from "../model-function/embed-text/TextEmbeddingModel.js";
import {
  embedText,
  embedTexts,
} from "../model-function/embed-text/embedText.js";
import { Run } from "../run/Run.js";
import { TextChunk } from "../text-chunk/TextChunk.js";
import { TextChunkRetrieverSettings } from "../text-chunk/retrieve-text-chunks/TextChunkRetriever.js";
import { VectorIndex } from "./VectorIndex.js";
import { FunctionOptions } from "../model-function/FunctionOptions.js";

export class VectorIndexTextChunkStore<CHUNK extends TextChunk, INDEX> {
  private readonly _index: VectorIndex<CHUNK, INDEX>;

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
    index: VectorIndex<CHUNK, INDEX>;
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

  async upsertChunk(
    {
      id = this.generateId(),
      chunk,
    }: {
      id?: string;
      keyText: string;
      chunk: CHUNK;
    },
    options?: { run?: Run }
  ): Promise<void> {
    this.upsertManyChunks(
      {
        ids: [id],
        chunks: [chunk],
      },
      options
    );
  }

  async upsertManyChunks(
    {
      ids,
      chunks,
    }: {
      ids?: Array<string | undefined>;
      chunks: CHUNK[];
    },
    options?: { run?: Run }
  ) {
    const vectors = await embedTexts(
      this.embeddingModel,
      chunks.map((chunk) => chunk.content),
      {
        functionId: this.upsertFunctionId,
        run: options?.run,
      }
    );

    this._index.upsertMany(
      vectors.map((vector, i) => ({
        id: ids?.[i] ?? this.generateId(),
        vector,
        data: chunks[i],
      }))
    );
  }

  async retrieveSimilarTextChunks(
    queryText: string,
    options?: FunctionOptions<TextChunkRetrieverSettings> | undefined
  ): Promise<CHUNK[]> {
    const queryResult = await this._index.queryByVector({
      queryVector: await embedText(this.embeddingModel, queryText, {
        functionId: this.queryFunctionId,
        run: options?.run,
      }),
      maxResults: 1,
      similarityThreshold: undefined,
    });

    return queryResult.map((item) => item.data);
  }

  get index(): INDEX {
    return this._index.asIndex();
  }
}
