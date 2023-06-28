import { Vector } from "../../run/Vector.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "./TextEmbeddingModel.js";

export abstract class AbstractTextEmbeddingModel<
    RESPONSE,
    SETTINGS extends TextEmbeddingModelSettings
  >
  extends AbstractModel<SETTINGS>
  implements TextEmbeddingModel<SETTINGS>
{
  constructor({
    settings,
    extractEmbeddings,
    generateResponse,
  }: {
    settings: SETTINGS;
    extractEmbeddings: (response: RESPONSE) => Vector[];
    generateResponse: (
      texts: string[],
      options?: FunctionOptions<SETTINGS>
    ) => PromiseLike<RESPONSE>;
  }) {
    super({ settings });

    this.extractEmbeddings = extractEmbeddings;
    this.generateResponse = generateResponse;
  }

  abstract readonly maxTokens: number;
  abstract readonly embeddingDimensions: number;
  protected abstract readonly maxTextsPerCall: number;

  private extractEmbeddings: (response: RESPONSE) => Vector[];
  private generateResponse: (
    texts: string[],
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  async embedTexts(
    texts: string[],
    options?: FunctionOptions<SETTINGS>
  ): Promise<Vector[]> {
    return executeCall<SETTINGS, this, Vector[], RESPONSE[]>({
      model: this,
      options,
      errorHandler: this.uncaughtErrorHandler,
      callModel: (model, options) => model.embedTexts(texts, options),
      generateResponse: (options) => {
        // split the texts into groups that are small enough to be sent in one call:
        const maxTextsPerCall = this.maxTextsPerCall;
        const textGroups: string[][] = [];
        for (let i = 0; i < texts.length; i += maxTextsPerCall) {
          textGroups.push(texts.slice(i, i + maxTextsPerCall));
        }

        return Promise.all(
          textGroups.map((textGroup) =>
            this.generateResponse(textGroup, options)
          )
        );
      },
      extractOutputValue: (result) => {
        const embeddings: Array<Vector> = [];
        for (const response of result) {
          embeddings.push(...this.extractEmbeddings(response));
        }
        return embeddings;
      },
      getStartEvent: (metadata) => ({
        type: "text-embedding-started",
        metadata,
        texts,
      }),
      getAbortEvent: (metadata) => ({
        type: "text-embedding-finished",
        status: "abort",
        metadata,
        texts,
      }),
      getFailureEvent: (metadata, error) => ({
        type: "text-embedding-finished",
        status: "failure",
        metadata,
        error,
        texts,
      }),
      getSuccessEvent: (metadata, response, output) => ({
        type: "text-embedding-finished",
        status: "success",
        metadata,
        texts,
        response,
        generatedEmbeddings: output,
      }),
    });
  }

  async embedText(
    text: string,
    options?: FunctionOptions<SETTINGS>
  ): Promise<Vector> {
    return (await this.embedTexts([text], options))[0];
  }
}
