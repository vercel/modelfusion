import { nanoid as createId } from "nanoid";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../model-function/embed-text/TextEmbeddingModel.js";
import {
  embedText,
  embedTexts,
} from "../model-function/embed-text/embedText.js";
import { Run } from "../run/Run.js";
import { TextChunk } from "../text-chunk/TextChunk.js";
import { TextChunkRetrieverSettings } from "../text-chunk/retrieve-text-chunks/TextChunkRetriever.js";
import { VectorIndex } from "./VectorIndex.js";
import { FunctionOptions } from "../model-function/FunctionOptions.js";

export class VectorIndexTextChunkStore<
  CHUNK extends TextChunk,
  INDEX,
  MODEL extends TextEmbeddingModel<unknown, TextEmbeddingModelSettings>,
> {
  private readonly _index: VectorIndex<CHUNK, INDEX>;

  private readonly generateId: () => string;

  private readonly embeddingModel: MODEL;
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
    embeddingModel: MODEL;
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
    const { embeddings } = await embedTexts(
      this.embeddingModel,
      chunks.map((chunk) => chunk.content),
      {
        functionId: this.upsertFunctionId,
        run: options?.run,
      }
    );

    this._index.upsertMany(
      embeddings.map((embedding, i) => ({
        id: ids?.[i] ?? this.generateId(),
        vector: embedding,
        data: chunks[i],
      }))
    );
  }

  async retrieveSimilarTextChunks(
    queryText: string,
    options?: FunctionOptions<TextChunkRetrieverSettings> | undefined
  ): Promise<CHUNK[]> {
    const { embedding } = await embedText(this.embeddingModel, queryText, {
      functionId: this.queryFunctionId,
      run: options?.run,
    });

    const queryResult = await this._index.queryByVector({
      queryVector: embedding,
      maxResults: 1,
      similarityThreshold: undefined,
    });

    return queryResult.map((item) => item.data);
  }

  get index(): INDEX {
    return this._index.asIndex();
  }
}
