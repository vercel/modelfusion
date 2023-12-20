import { Vector } from "../core/Vector.js";

export interface VectorIndex<DATA, INDEX, FILTER> {
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
    filter?: FILTER;
  }): Promise<Array<{ id: string; data: DATA; similarity?: number }>>;

  asIndex(): INDEX;
}
