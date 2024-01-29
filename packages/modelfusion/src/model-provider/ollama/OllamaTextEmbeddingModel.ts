import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions";
import { ApiConfiguration } from "../../core/api/ApiConfiguration";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi";
import { zodSchema } from "../../core/schema/ZodSchema";
import { AbstractModel } from "../../model-function/AbstractModel";
import {
  EmbeddingModel,
  EmbeddingModelSettings,
} from "../../model-function/embed/EmbeddingModel";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration";
import { failedOllamaCallResponseHandler } from "./OllamaError";

export interface OllamaTextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;
  model: string;
  dimensions?: number;
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

  get dimensions() {
    return this.settings.dimensions;
  }

  async callAPI(
    texts: Array<string>,
    callOptions: FunctionCallOptions
  ): Promise<OllamaTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Ollama embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    const api = this.settings.api ?? new OllamaApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/api/embeddings`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            model: this.settings.model,
            prompt: texts[0],
          },
          failedResponseHandler: failedOllamaCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(ollamaTextEmbeddingResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<OllamaTextEmbeddingModelSettings> {
    return {
      dimensions: this.settings.dimensions,
    };
  }

  async doEmbedValues(texts: string[], options: FunctionCallOptions) {
    const rawResponse = await this.callAPI(texts, options);

    return {
      rawResponse,
      embeddings: [rawResponse.embedding],
    };
  }

  withSettings(additionalSettings: Partial<OllamaTextEmbeddingModelSettings>) {
    return new OllamaTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const ollamaTextEmbeddingResponseSchema = z.object({
  embedding: z.array(z.number()),
});

export type OllamaTextEmbeddingResponse = z.infer<
  typeof ollamaTextEmbeddingResponseSchema
>;
