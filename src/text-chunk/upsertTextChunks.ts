import { nanoid as createId } from "nanoid";
import { FunctionOptions } from "../model-function/FunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../model-function/embed-text/TextEmbeddingModel.js";
import { embedTexts } from "../model-function/embed-text/embedText.js";
import { TextChunk } from "./TextChunk.js";
import { VectorIndex } from "../vector-index/VectorIndex.js";

export async function upsertTextChunks<
  CHUNK extends TextChunk,
  SETTINGS extends TextEmbeddingModelSettings,
>(
  {
    vectorIndex,
    embeddingModel,
    generateId = createId,
    chunks,
    ids,
  }: {
    vectorIndex: VectorIndex<CHUNK, unknown>;
    embeddingModel: TextEmbeddingModel<unknown, SETTINGS>;
    generateId?: () => string;
    chunks: CHUNK[];
    ids?: Array<string | undefined>;
  },
  options?: FunctionOptions<SETTINGS>
) {
  // many embedding models support bulk embedding, so we first embed all texts:
  const embeddings = await embedTexts(
    embeddingModel,
    chunks.map((chunk) => chunk.text),
    options
  );

  await vectorIndex.upsertMany(
    chunks.map((chunk, i) => ({
      id: ids?.[i] ?? generateId(),
      vector: embeddings[i],
      data: chunk,
    }))
  );
}
