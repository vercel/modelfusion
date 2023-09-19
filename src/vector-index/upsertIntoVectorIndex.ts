import { nanoid as createId } from "nanoid";
import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../model-function/embed-text/TextEmbeddingModel.js";
import { embedTexts } from "../model-function/embed-text/embedText.js";
import { VectorIndex } from "./VectorIndex.js";

export async function upsertIntoVectorIndex<
  OBJECT,
  SETTINGS extends TextEmbeddingModelSettings,
>(
  {
    vectorIndex,
    embeddingModel,
    generateId = createId,
    objects,
    getValueToEmbed,
    getId,
  }: {
    vectorIndex: VectorIndex<OBJECT, unknown>;
    embeddingModel: TextEmbeddingModel<unknown, SETTINGS>;
    generateId?: () => string;
    objects: OBJECT[];
    getValueToEmbed: (object: OBJECT, index: number) => string;
    getId?: (object: OBJECT, index: number) => string | undefined;
  },
  options?: ModelFunctionOptions<SETTINGS>
) {
  // many embedding models support bulk embedding, so we first embed all texts:
  const embeddings = await embedTexts(
    embeddingModel,
    objects.map(getValueToEmbed),
    options
  );

  await vectorIndex.upsertMany(
    objects.map((object, i) => ({
      id: getId?.(object, i) ?? generateId(),
      vector: embeddings[i],
      data: object,
    }))
  );
}
