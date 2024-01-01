import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import {
  EmbeddingModel,
  EmbeddingModelSettings,
} from "../../model-function/embed/EmbeddingModel.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { failedOllamaCallResponseHandler } from "./OllamaError.js";

export interface OllamaTextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;
  model: string;
  embeddingDimensions?: number;
  isParallelizable?: boolean;
}

export class OllamaTextEmbeddingModel
  extends AbstractModel<OllamaTextEmbeddingModelSettings>
  implements EmbeddingModel<string, OllamaTextEmbeddingModelSettings>
{
  constructor(settings: OllamaTextEmbeddingModelSettings) {
    super({ settings });
  }

  readonly provider = "ollama" as const;
  get modelName() {
    return null;
  }

  readonly maxValuesPerCall = 1;
  get isParallelizable() {
    return this.settings.isParallelizable ?? false;
  }

  get embeddingDimensions() {
    return this.settings.embeddingDimensions;
  }

  async callAPI(
    texts: Array<string>,
    options?: FunctionOptions
  ): Promise<OllamaTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Ollama embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    const api = this.settings.api ?? new OllamaApiConfiguration();
    const abortSignal = options?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/api/embeddings`),
          headers: api.headers,
          body: {
            model: this.settings.model,
            prompt: texts[0],
          },
          failedResponseHandler: failedOllamaCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            ollamaTextEmbeddingResponseSchema
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<OllamaTextEmbeddingModelSettings> {
    return {
      embeddingDimensions: this.settings.embeddingDimensions,
    };
  }

  async doEmbedValues(texts: string[], options?: FunctionOptions) {
    const response = await this.callAPI(texts, options);

    return {
      response,
      embeddings: [response.embedding],
    };
  }

  withSettings(additionalSettings: Partial<OllamaTextEmbeddingModelSettings>) {
    return new OllamaTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const ollamaTextEmbeddingResponseSchema = zodSchema(
  z.object({
    embedding: z.array(z.number()),
  })
);

export type OllamaTextEmbeddingResponse =
  (typeof ollamaTextEmbeddingResponseSchema)["_type"];
