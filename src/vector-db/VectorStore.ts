import { Vector } from "../run/Vector.js";

export interface VectorStore<DATA, STORE> {
  upsertMany(
    data: Array<{
      id: string;
      vector: Vector;
      data: DATA;
    }>
  ): Promise<void>;

  queryByVector(options: {
    queryVector: Vector;
    maxResults: number;
    similarityThreshold?: number;
  }): Promise<Array<{ id: string; data: DATA; similarity?: number }>>;

  asStore(): STORE;
}
