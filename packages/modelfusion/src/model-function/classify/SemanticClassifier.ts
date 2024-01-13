import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Vector } from "../../core/Vector.js";
import { cosineSimilarity } from "../../util/cosineSimilarity.js";
import { EmbeddingModel } from "../embed/EmbeddingModel.js";
import { embed, embedMany } from "../embed/embed.js";
import { Classifier, ClassifierSettings } from "./Classifier.js";

export interface SemanticCluster<VALUE, NAME extends string> {
  name: NAME;
  values: VALUE[];
}

export interface SemanticClassifierSettings<
  VALUE,
  CLUSTERS extends Array<SemanticCluster<VALUE, string>>,
> extends ClassifierSettings {
  clusters: CLUSTERS;
  embeddingModel: EmbeddingModel<VALUE>;
  similarityThreshold: number;
}

export class SemanticClassifier<
  VALUE,
  CLUSTERS extends Array<SemanticCluster<VALUE, string>>,
> implements
    Classifier<
      VALUE,
      ClusterNames<CLUSTERS> | null,
      SemanticClassifierSettings<VALUE, CLUSTERS>
    >
{
  readonly settings: SemanticClassifierSettings<VALUE, CLUSTERS>;

  readonly modelInformation = {
    provider: "modelfusion",
    modelName: "SemanticClassifier",
  };

  private embeddings:
    | Array<{
        embedding: Vector;
        clusterValue: VALUE;
        clusterName: string;
      }>
    | undefined;

  constructor(settings: SemanticClassifierSettings<VALUE, CLUSTERS>) {
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

  get settingsForEvent(): Partial<SemanticClassifierSettings<VALUE, CLUSTERS>> {
    const eventSettingProperties: Array<string> = [
      "clusters",
      "embeddingModel",
      "similarityThreshold",
    ] satisfies (keyof SemanticClassifierSettings<VALUE, CLUSTERS>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  withSettings(
    additionalSettings: Partial<SemanticClassifierSettings<VALUE, CLUSTERS>>
  ) {
    return new SemanticClassifier(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

type ClusterNames<CLUSTERS> = CLUSTERS extends Array<
  SemanticCluster<unknown, infer NAME>
>
  ? NAME
  : never;
