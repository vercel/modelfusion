import { Vector } from "../core/Vector.js";
import { EmbeddingModel } from "../model-function/embed/EmbeddingModel.js";
import { embed, embedMany } from "../model-function/embed/embed.js";
import { cosineSimilarity } from "../util/cosineSimilarity.js";

export interface SemanticCluster<VALUE, NAME extends string> {
  name: NAME;
  values: VALUE[];
}

export class SemanticClassifier<
  VALUE,
  CLUSTERS extends Array<SemanticCluster<VALUE, string>>,
> {
  readonly clusters: CLUSTERS;
  readonly embeddingModel: EmbeddingModel<VALUE>;
  readonly similarityThreshold: number;

  private embeddings:
    | Array<{
        embedding: Vector;
        clusterValue: VALUE;
        clusterName: string;
      }>
    | undefined;

  constructor({
    clusters,
    embeddingModel,
    similarityThreshold,
  }: {
    clusters: CLUSTERS;
    embeddingModel: EmbeddingModel<VALUE>;
    similarityThreshold: number;
  }) {
    this.clusters = clusters;
    this.embeddingModel = embeddingModel;
    this.similarityThreshold = similarityThreshold;
  }

  async getEmbeddings() {
    if (this.embeddings != null) {
      return this.embeddings;
    }

    const embeddings: Array<{
      embedding: Vector;
      clusterValue: VALUE;
      clusterName: string;
    }> = [];

    for (const cluster of this.clusters) {
      const clusterEmbeddings = await embedMany({
        model: this.embeddingModel,
        values: cluster.values,
      });

      for (let i = 0; i < clusterEmbeddings.length; i++) {
        embeddings.push({
          embedding: clusterEmbeddings[i],
          clusterValue: cluster.values[i],
          clusterName: cluster.name,
        });
      }
    }

    this.embeddings = embeddings; // lazy caching

    return embeddings;
  }

  async classify(value: VALUE): Promise<ClusterNames<CLUSTERS> | null> {
    const valueEmbedding = await embed({
      model: this.embeddingModel,
      value,
    });
    const clusterEmbeddings = await this.getEmbeddings();

    const allMatches: Array<{
      similarity: number;
      clusterValue: VALUE;
      clusterName: string;
    }> = [];

    for (const embedding of clusterEmbeddings) {
      const similarity = cosineSimilarity(valueEmbedding, embedding.embedding);

      if (similarity >= this.similarityThreshold) {
        allMatches.push({
          similarity,
          clusterValue: embedding.clusterValue,
          clusterName: embedding.clusterName,
        });
      }
    }

    // sort (highest similarity first)
    allMatches.sort((a, b) => b.similarity - a.similarity);

    return allMatches.length > 0
      ? (allMatches[0].clusterName as unknown as ClusterNames<CLUSTERS>)
      : null;
  }
}

type ClusterNames<CLUSTERS> = CLUSTERS extends Array<
  SemanticCluster<unknown, infer NAME>
>
  ? NAME
  : never;
