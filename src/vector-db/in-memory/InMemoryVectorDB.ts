import * as fs from "fs/promises";
import { z } from "zod";
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
  /**
   * Writes the content of the database to a file.
   *
   * @param {InMemoryVectorDB<DATA>} options.database - The database to write.
   * @param {string} options.filename - The file name to write to.
   */
  static async writeToFile<DATA>({
    database,
    filename,
  }: {
    database: InMemoryVectorDB<DATA>;
    filename: string;
  }): Promise<void> {
    await fs.writeFile(filename, JSON.stringify(database.entries), {
      encoding: "utf-8",
    });
  }

  /**
   * Loads a database from a file. Validates the entries using a provided Zod schema.
   *
   * @param {string} options.filename - The name of the file to load.
   * @param {z.ZodType<DATA>} options.schema - The Zod schema to validate the entries.
   * @returns {Promise<{ success: true; database: InMemoryVectorDB<DATA> } | { success: false; error: z.ZodError }>} - A promise that resolves to either a success object with the loaded database, or an error object with the error.
   */
  static async safeLoadFromFile<DATA>({
    filename,
    schema,
  }: {
    filename: string;
    schema: z.ZodType<DATA>;
  }): Promise<
    | { success: true; database: InMemoryVectorDB<DATA> }
    | { success: false; error: z.ZodError }
  > {
    const fileContents = await fs.readFile(filename, { encoding: "utf-8" });
    const data: Array<Entry<DATA>> = JSON.parse(fileContents);

    // Validate data using zod
    const validationResults = data.map((entry) => schema.safeParse(entry.data));

    // Find the first validation error
    const errorResult = validationResults.find((result) => !result.success);

    // If there's an error, return it along with success: false
    if (errorResult && errorResult.success === false) {
      return { success: false, error: errorResult.error };
    }

    // If no errors, push data to a new database and return it with success: true
    const database = new InMemoryVectorDB<DATA>();
    database.entries.push(...data);
    return { success: true, database };
  }

  /**
   * Loads a database from a file without validating the entries.
   *
   * @param {string} options.filename - The name of the file to load.
   * @returns {Promise<InMemoryVectorDB<DATA>>} - A promise that resolves to the loaded database.
   */
  static async loadFromFile<DATA>({
    filename,
  }: {
    filename: string;
  }): Promise<InMemoryVectorDB<DATA>> {
    const fileContents = await fs.readFile(filename, { encoding: "utf-8" });
    const data: Array<Entry<DATA>> = JSON.parse(fileContents);
    const database = new InMemoryVectorDB<DATA>();
    database.entries.push(...data);
    return database;
  }

  private readonly entries: Array<Entry<DATA>> = [];

  /**
   * Stores an entry in the database.
   *
   * @param {number[]} options.vectorKey - The vector key associated with the data.
   * @param {DATA} options.data - The data to store.
   */
  async store({ vectorKey, data }: { vectorKey: number[]; data: DATA }) {
    this.entries.push({ vectorKey, data });
  }

  /**
   * Retrieves data from the database based on cosine similarity to a query vector.
   *
   * @param {number[]} options.queryVector - The query vector.
   * @param {number} [options.maxResults] - The maximum number of results to return.
   * @param {number} [options.similarityThreshold] - The minimum cosine similarity for data to be considered a match.
   * @returns {Promise<Array<{ data: DATA; similarity: number }>>} - A promise that resolves to an array of the matched data and their similarities.
   */
  async retrieve(
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
}
