import { z } from "zod";
import { Vector } from "../../core/Vector.js";
import { Schema } from "../../core/schema/Schema.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { cosineSimilarity } from "../../util/cosineSimilarity.js";
import { VectorIndex } from "../VectorIndex.js";

type Entry<DATA> = {
  id: string;
  vector: Vector;
  data: DATA;
};

const jsonDataSchema = zodSchema(
  z.array(
    z.object({
      id: z.string(),
      vector: z.array(z.number()),
      data: z.unknown(),
    })
  )
);

/**
 * A very simple vector index that stores all entries in memory. Useful when you only have
 * a small number of entries and don't want to set up a real database, e.g. for conversational memory
 * that does not need to be persisted.
 */
export class MemoryVectorIndex<DATA>
  implements
    VectorIndex<DATA, MemoryVectorIndex<DATA>, (value: DATA) => boolean>
{
  static async deserialize<DATA>({
    serializedData,
    schema,
  }: {
    serializedData: string;
    schema?: Schema<DATA>;
  }) {
    // validate the outer structure:
    const json = parseJSON({ text: serializedData, schema: jsonDataSchema });

    if (schema != null) {
      // when a schema is provided, validate all entries:
      for (const entry of json) {
        const validationResult = schema.validate(entry.data);
        if (!validationResult.success) {
          throw validationResult.error;
        }
      }
    }

    const vectorIndex = new MemoryVectorIndex<DATA>();

    vectorIndex.upsertMany(
      json as Array<{
        id: string;
        vector: Vector;
        data: DATA;
      }>
    );

    return vectorIndex;
  }

  private readonly entries: Map<string, Entry<DATA>> = new Map();

  async upsertMany(
    data: Array<{
      id: string;
      vector: Vector;
      data: DATA;
    }>
  ) {
    for (const entry of data) {
      this.entries.set(entry.id, entry);
    }
  }

  async queryByVector({
    queryVector,
    similarityThreshold,
    maxResults,
    filter,
  }: {
    queryVector: Vector;
    maxResults: number;
    similarityThreshold?: number;
    filter?: (value: DATA) => boolean;
  }): Promise<Array<{ id: string; data: DATA; similarity?: number }>> {
    const results = [...this.entries.values()]
      .filter((value) => filter?.(value.data) ?? true)
      .map((entry) => ({
        id: entry.id,
        similarity: cosineSimilarity(entry.vector, queryVector),
        data: entry.data,
      }))
      .filter(
        (entry) =>
          similarityThreshold == undefined ||
          entry.similarity == undefined ||
          entry.similarity > similarityThreshold
      );

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, maxResults);
  }

  serialize(): string {
    return JSON.stringify([...this.entries.values()]);
  }

  asIndex(): MemoryVectorIndex<DATA> {
    return this;
  }
}
