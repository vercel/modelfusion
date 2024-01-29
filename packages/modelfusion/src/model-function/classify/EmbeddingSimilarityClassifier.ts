import { FunctionCallOptions } from "../../core/FunctionOptions";
import { Vector } from "../../core/Vector";
import { cosineSimilarity } from "../../util/cosineSimilarity";
import { EmbeddingModel } from "../embed/EmbeddingModel";
import { embed, embedMany } from "../embed/embed";
import { Classifier, ClassifierSettings } from "./Classifier";

export interface ValueCluster<VALUE, NAME extends string> {
  name: NAME;
  values: VALUE[];
}

export interface EmbeddingSimilarityClassifierSettings<
  VALUE,
  CLUSTERS extends Array<ValueCluster<VALUE, string>>,
> extends ClassifierSettings {
  clusters: CLUSTERS;
  embeddingModel: EmbeddingModel<VALUE>;
  similarityThreshold: number;
}

/**
 * Classifies values based on their distance to the values from a set of clusters.
 * When the distance is below a certain threshold, the value is classified as belonging to the cluster,
 * and the cluster name is returned. Otherwise, the value is classified as null.
 */
export class EmbeddingSimilarityClassifier<
  VALUE,
  CLUSTERS extends Array<ValueCluster<VALUE, string>>,
> implements
    Classifier<
      VALUE,
      ClusterNames<CLUSTERS> | null,
      EmbeddingSimilarityClassifierSettings<VALUE, CLUSTERS>
    >
{
  readonly settings: EmbeddingSimilarityClassifierSettings<VALUE, CLUSTERS>;

  readonly modelInformation = {
    provider: "modelfusion",
    modelName: "EmbeddingSimilarityClassifier",
  };

  private embeddings:
    | Array<{
        embedding: Vector;
        clusterValue: VALUE;
        clusterName: string;
      }>
    | undefined;

  constructor(
    settings: EmbeddingSimilarityClassifierSettings<VALUE, CLUSTERS>
  ) {
    this.settings = settings;
  }

  async getEmbeddings(options: FunctionCallOptions) {
    if (this.embeddings != null) {
      return this.embeddings;
    }

    const embeddings: Array<{
      embedding: Vector;
      clusterValue: VALUE;
      clusterName: string;
    }> = [];

    for (const cluster of this.settings.clusters) {
      const clusterEmbeddings = await embedMany({
        model: this.settings.embeddingModel,
        values: cluster.values,
        ...options,
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

  async doClassify(value: VALUE, options: FunctionCallOptions) {
    const valueEmbedding = await embed({
      model: this.settings.embeddingModel,
      value,
      ...options,
    });

    const clusterEmbeddings = await this.getEmbeddings(options);

    const allMatches: Array<{
      similarity: number;
      clusterValue: VALUE;
      clusterName: string;
    }> = [];

    for (const embedding of clusterEmbeddings) {
      const similarity = cosineSimilarity(valueEmbedding, embedding.embedding);

      if (similarity >= this.settings.similarityThreshold) {
        allMatches.push({
          similarity,
          clusterValue: embedding.clusterValue,
          clusterName: embedding.clusterName,
        });
      }
    }

    // sort (highest similarity first)
    allMatches.sort((a, b) => b.similarity - a.similarity);

    return {
      class:
        allMatches.length > 0
          ? (allMatches[0].clusterName as unknown as ClusterNames<CLUSTERS>)
          : null,
      rawResponse: undefined,
    };
  }

  get settingsForEvent(): Partial<
    EmbeddingSimilarityClassifierSettings<VALUE, CLUSTERS>
  > {
    const eventSettingProperties: Array<string> = [
      "clusters",
      "embeddingModel",
      "similarityThreshold",
    ] satisfies (keyof EmbeddingSimilarityClassifierSettings<
      VALUE,
      CLUSTERS
    >)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  withSettings(
    additionalSettings: Partial<
      EmbeddingSimilarityClassifierSettings<VALUE, CLUSTERS>
    >
  ) {
    return new EmbeddingSimilarityClassifier(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

type ClusterNames<CLUSTERS> =
  CLUSTERS extends Array<ValueCluster<unknown, infer NAME>> ? NAME : never;
