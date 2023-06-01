import { RunContext } from "../../run/RunContext.js";
import { cosineSimilarity } from "../../util/cosineSimilarity.js";

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

  async store({ vectorKey, data }: { vectorKey: number[]; data: DATA }) {
    this.entries.push({ vectorKey, data });
  }

  async retrieve(
    {
      queryVector,
      maxResults = 5,
      similarityThreshold = 0.5,
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
}
