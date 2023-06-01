import { RunContext } from "../../run/RunContext.js";
import { cosineSimilarity } from "../../util/cosineSimilarity.js";
import z from "zod";

type Entry<DATA> = {
  vectorKey: number[];
  data: DATA;
};

/**
 * A very simple vector database that stores all entries in memory. Useful when you only have
 * a small number of entries and don't want to set up a real database.
 */
export class InMemoryVectorDB<DATA> {
  private readonly entries: Array<Entry<DATA>> = [];

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
          vectorKey: z.array(z.number()),
          data: schema,
        })
      )
      .parse(json);

    const database = new InMemoryVectorDB<DATA>();
    for (const entry of parsedJson) {
      const f = entry.data as DATA;
      database.store({ vectorKey: entry.vectorKey, data: f });
    }

    return database;
  }

  /**
   * Stores an entry in the database.
   *
   * @param {number[]} options.vectorKey - The vector key associated with the data.
   * @param {DATA} options.data - The data to store.
   */
  async store({ vectorKey, data }: { vectorKey: number[]; data: DATA }) {
    this.entries.push({ vectorKey, data });
  }

  async storeMany({
    vectorKeys,
    data,
  }: {
    vectorKeys: number[][];
    data: DATA[];
  }) {
    if (vectorKeys.length !== data.length) {
      throw new Error(
        "The number of vector keys and data must be the same when storing many entries."
      );
    }

    for (let i = 0; i < vectorKeys.length; i++) {
      this.entries.push({ vectorKey: vectorKeys[i], data: data[i] });
    }
  }

  /**
   * Retrieves data from the database based on cosine similarity to a query vector.
   *
   * @param {number[]} options.queryVector - The query vector.
   * @param {number} [options.maxResults] - The maximum number of results to return.
   * @param {number} [options.similarityThreshold] - The minimum cosine similarity for data to be considered a match.
   * @returns {Promise<Array<{ data: DATA; similarity: number }>>} - A promise that resolves to an array of the matched data and their similarities.
   */
  async search(
    {
      queryVector,
      maxResults,
      similarityThreshold,
    }: {
      queryVector: number[];
      maxResults?: number;
      similarityThreshold: number;
    },
    _context?: RunContext
  ): Promise<Array<{ data: DATA; similarity: number }>> {
    const results = [...this.entries.values()]
      .map((entry) => ({
        similarity: cosineSimilarity(entry.vectorKey, queryVector),
        data: entry.data,
      }))
      .filter((entry) => entry.similarity > similarityThreshold);

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, maxResults);
  }

  serialize(): string {
    return JSON.stringify(this.entries);
  }
}
