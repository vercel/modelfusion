import { nanoid as createId } from "nanoid";
import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import {
  EmbeddingModel,
  EmbeddingModelSettings,
} from "../model-function/embed/EmbeddingModel.js";
import { embedMany } from "../model-function/embed/embed.js";
import { VectorIndex } from "./VectorIndex.js";

export async function upsertIntoVectorIndex<
  VALUE,
  OBJECT,
  SETTINGS extends EmbeddingModelSettings,
>(
  {
    vectorIndex,
    embeddingModel,
    generateId = createId,
    objects,
    getValueToEmbed,
    getId,
  }: {
    vectorIndex: VectorIndex<OBJECT, unknown, unknown>;
    embeddingModel: EmbeddingModel<VALUE, unknown, SETTINGS>;
    generateId?: () => string;
    objects: OBJECT[];
    getValueToEmbed: (object: OBJECT, index: number) => VALUE;
    getId?: (object: OBJECT, index: number) => string | undefined;
  },
  options?: ModelFunctionOptions<SETTINGS>
) {
  // many embedding models support bulk embedding, so we first embed all texts:
  const embeddings = await embedMany(
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
