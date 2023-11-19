import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/index.js";
import { Schema, Vector, VectorIndex } from "modelfusion";

export class PineconeVectorIndex<DATA extends object | undefined>
  implements VectorIndex<DATA, PineconeVectorIndex<DATA>, null>
{
  readonly index: VectorOperationsApi;
  readonly namespace?: string;
  readonly schema: Schema<DATA>;

  constructor({
    index,
    namespace,
    schema,
  }: {
    index: VectorOperationsApi;
    namespace?: string;
    schema: Schema<DATA>;
  }) {
    this.index = index;
    this.namespace = namespace;
    this.schema = schema;
  }

  async upsertMany(
    data: Array<{
      id: string;
      vector: Vector;
      data: DATA;
    }>
  ) {
    this.index.upsert({
      upsertRequest: {
        namespace: this.namespace,
        vectors: data.map((entry) => ({
          id: entry.id,
          values: entry.vector,
          metadata: entry.data,
        })),
      },
    });
  }

  async queryByVector({
    queryVector,
    similarityThreshold,
    maxResults,
  }: {
    queryVector: Vector;
    maxResults: number;
    similarityThreshold?: number;
  }): Promise<Array<{ id: string; data: DATA; similarity?: number }>> {
    const { matches } = await this.index.query({
      queryRequest: {
        namespace: this.namespace,
        vector: queryVector,
        topK: maxResults,
        includeMetadata: true,
      },
    });

    if (matches == undefined) {
      return [];
    }

    return matches
      .filter(
        (match) =>
          similarityThreshold == undefined ||
          match.score == undefined ||
          match.score > similarityThreshold
      )
      .map((match) => {
        const validationResult = this.schema.validate(match.metadata);

        if (!validationResult.success) {
          throw validationResult.error;
        }

        return {
          id: match.id,
          data: validationResult.data,
          similarity: match.score,
        };
      });
  }

  asIndex(): PineconeVectorIndex<DATA> {
    return this;
  }
}
