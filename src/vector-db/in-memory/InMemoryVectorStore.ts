import { VectorStore } from "index.js";
import z from "zod";
import { Vector } from "../../run/Vector.js";
import { cosineSimilarity } from "../../util/cosineSimilarity.js";

type Entry<DATA> = {
  id: string;
  vector: Vector;
  data: DATA;
};

/**
 * A very simple vector store that stores all entries in memory. Useful when you only have
 * a small number of entries and don't want to set up a real database, e.g. for conversational memory
 * that does not need to be persisted.
 */
export class InMemoryVectorStore<DATA> implements VectorStore<DATA> {
  static async deserialize<DATA>({
    serializedData,
    schema,
  }: {
    serializedData: string;
    schema: z.ZodSchema<DATA>;
  }) {
    const json = JSON.parse(serializedData);
    const parsedJson = z
      .array(
        z.object({
          id: z.string(),
          vector: z.array(z.number()),
          data: schema,
        })
      )
      .parse(json);

    const vectorStore = new InMemoryVectorStore<DATA>();
    for (const entry of parsedJson) {
      vectorStore.upsert({
        id: entry.id,
        vector: entry.vector,
        data: entry.data as DATA,
      });
    }

    return vectorStore;
  }

  private readonly entries: Map<string, Entry<DATA>> = new Map();

  async upsert(entry: { id: string; vector: Vector; data: DATA }) {
    this.entries.set(entry.id, entry);
  }

  async query({
    queryVector,
    similarityThreshold,
    maxResults,
  }: {
    queryVector: Vector;
    maxResults?: number;
    similarityThreshold: number;
  }): Promise<Array<{ id: string; data: DATA; similarity: number }>> {
    const results = [...this.entries.values()]
      .map((entry) => ({
        id: entry.id,
        similarity: cosineSimilarity(entry.vector, queryVector),
        data: entry.data,
      }))
      .filter((entry) => entry.similarity > similarityThreshold);

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, maxResults);
  }

  serialize(): string {
    return JSON.stringify([...this.entries.values()]);
  }
}
