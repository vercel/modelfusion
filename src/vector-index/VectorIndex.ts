import { Vector } from "../core/Vector.js";

export interface VectorIndex<DATA, INDEX> {
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

  asIndex(): INDEX;
}
