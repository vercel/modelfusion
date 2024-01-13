import { nanoid as createId } from "nanoid";
import { FunctionOptions } from "../core/FunctionOptions.js";
import { executeFunctionCall } from "../core/executeFunctionCall.js";
import {
  EmbeddingModel,
  EmbeddingModelSettings,
} from "../model-function/embed/EmbeddingModel.js";
import { embedMany } from "../model-function/embed/embed.js";
import { VectorIndex } from "./VectorIndex.js";

export async function upsertIntoVectorIndex<VALUE, OBJECT>(
  {
    vectorIndex,
    embeddingModel,
    generateId = createId,
    objects,
    getValueToEmbed,
    getId,
  }: {
    vectorIndex: VectorIndex<OBJECT, unknown, unknown>;
    embeddingModel: EmbeddingModel<VALUE, EmbeddingModelSettings>;
    generateId?: () => string;
    objects: OBJECT[];
    getValueToEmbed: (object: OBJECT, index: number) => VALUE;
    getId?: (object: OBJECT, index: number) => string | undefined;
  },
  options?: FunctionOptions
) {
  return executeFunctionCall({
    options,
    input: objects,
    functionType: "upsert-into-vector-index",
    inputPropertyName: "objects",
    execute: async (options) => {
      // many embedding models support bulk embedding, so we first embed all texts:
      const embeddings = await embedMany({
        model: embeddingModel,
        values: objects.map(getValueToEmbed),
        ...options,
      });

      await vectorIndex.upsertMany(
        objects.map((object, i) => ({
          id: getId?.(object, i) ?? generateId(),
          vector: embeddings[i],
          data: object,
        }))
      );
    },
  });
}
