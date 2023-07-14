import { nanoid as createId } from "nanoid";
import { FunctionOptions } from "../model/FunctionOptions.js";
import { TextEmbeddingModel } from "../model/embed-text/TextEmbeddingModel.js";
import { embedTexts } from "../model/embed-text/embedText.js";
import { TextChunk } from "../text-chunk/TextChunk.js";
import { VectorIndex } from "./VectorIndex.js";

export async function upsertTextChunks<CHUNK extends TextChunk>(
  {
    vectorIndex,
    embeddingModel,
    generateId = createId,
    chunks,
    ids,
  }: {
    vectorIndex: VectorIndex<CHUNK, any>;
    embeddingModel: TextEmbeddingModel<any, any>;
    generateId?: () => string;
    chunks: CHUNK[];
    ids?: Array<string | undefined>;
  },
  options?: FunctionOptions<{}>
) {
  // many embedding models support bulk embedding, so we first embed all texts:
  const vectors = await embedTexts(
    embeddingModel,
    chunks.map((chunk) => chunk.content),
    options
  );

  await vectorIndex.upsertMany(
    chunks.map((chunk, i) => ({
      id: ids?.[i] ?? generateId(),
      vector: vectors[i],
      data: chunk,
    }))
  );
}
