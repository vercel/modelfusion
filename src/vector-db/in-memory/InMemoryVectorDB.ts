import z from "zod";
import { RunContext } from "../../run/RunContext.js";
import { Vector } from "../../run/Vector.js";
import {
  TextEmbeddingFunction,
  TextsEmbeddingFunction,
} from "../../text/embed/TextEmbeddingFunction.js";
import { TextEmbeddingModel } from "../../text/embed/TextEmbeddingModel.js";
import { embedText, embedTexts } from "../../text/embed/embedText.js";
import { cosineSimilarity } from "../../util/cosineSimilarity.js";

type Entry<DATA> = {
  keyVector: Vector;
  data: DATA;
};

/**
 * A very simple vector database that stores all entries in memory. Useful when you only have
 * a small number of entries and don't want to set up a real database, e.g. for conversational memory
 * that does not need to be persisted.
 */
export class InMemoryVectorDB<DATA> {
  static async deserialize<DATA>({
    serializedData,
    schema,
    embeddingModel,
    queryFunctionId,
    storeFunctionId,
  }: {
    serializedData: string;
    schema: z.ZodSchema<DATA>;
    embeddingModel: TextEmbeddingModel<any>;
    queryFunctionId?: string;
    storeFunctionId?: string;
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

    const database = new InMemoryVectorDB<DATA>({
      embeddingModel,
      queryFunctionId,
      storeFunctionId,
    });
    for (const entry of parsedJson) {
      const f = entry.data as DATA;
      database.storeWithKeyVector({ keyVector: entry.vectorKey, data: f });
    }

    return database;
  }

  private readonly entries: Array<Entry<DATA>> = [];

  private readonly embedForStore: TextsEmbeddingFunction;
  private readonly embedForQuery: TextEmbeddingFunction;

  constructor({
    embeddingModel,
    queryFunctionId,
    storeFunctionId,
  }: {
    embeddingModel: TextEmbeddingModel<any>;
    queryFunctionId?: string;
    storeFunctionId?: string;
  }) {
    this.embedForStore = embedTexts.asFunction({
      model: embeddingModel,
      functionId: storeFunctionId,
    });
    this.embedForQuery = embedText.asFunction({
      model: embeddingModel,
      functionId: queryFunctionId,
    });
  }

  async storeWithTextKey(
    {
      keyText,
      data,
    }: {
      keyText: string;
      data: DATA;
    },
    context?: RunContext
  ): Promise<void> {
    this.storeWithKeyVector({
      keyVector: (await this.embedForStore([keyText], context))[0],
      data,
    });
  }

  async storeWithKeyVector({
    keyVector,
    data,
  }: {
    keyVector: Vector;
    data: DATA;
  }) {
    this.entries.push({ keyVector, data });
  }

  async storeManyWithTextKeys(
    {
      keyTexts,
      data,
    }: {
      keyTexts: Array<string>;
      data: DATA[];
    },
    context?: RunContext
  ) {
    this.storeManyWithKeyVectors({
      keyVectors: await this.embedForStore(keyTexts, context),
      data,
    });
  }

  async storeManyWithKeyVectors({
    keyVectors,
    data,
  }: {
    keyVectors: Vector[];
    data: DATA[];
  }) {
    if (keyVectors.length !== data.length) {
      throw new Error(
        "The number of vector keys and data must be the same when storing many entries."
      );
    }

    for (let i = 0; i < keyVectors.length; i++) {
      this.entries.push({ keyVector: keyVectors[i], data: data[i] });
    }
  }

  /**
   * Retrieves data from the database based on cosine similarity to a query text.
   */
  async queryByText(
    {
      queryText,
      maxResults,
      similarityThreshold,
    }: {
      queryText: string;
      maxResults?: number;
      similarityThreshold: number;
    },
    context?: RunContext
  ): Promise<Array<{ data: DATA; similarity: number }>> {
    return this.queryByVector({
      queryVector: await this.embedForQuery(queryText, context),
      maxResults,
      similarityThreshold,
    });
  }

  /**
   * Retrieves data from the database based on cosine similarity to a query vector.
   *
   * @param {Vector} options.queryVector - The query vector.
   * @param {number} [options.maxResults] - The maximum number of results to return.
   * @param {number} [options.similarityThreshold] - The minimum cosine similarity for data to be considered a match.
   * @returns {Promise<Array<{ data: DATA; similarity: number }>>} - A promise that resolves to an array of the matched data and their similarities.
   */
  async queryByVector({
    queryVector,
    maxResults,
    similarityThreshold,
  }: {
    queryVector: Vector;
    maxResults?: number;
    similarityThreshold: number;
  }): Promise<Array<{ data: DATA; similarity: number }>> {
    const results = [...this.entries.values()]
      .map((entry) => ({
        similarity: cosineSimilarity(entry.keyVector, queryVector),
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
