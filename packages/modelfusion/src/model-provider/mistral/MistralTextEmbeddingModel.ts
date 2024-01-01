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
import { MistralApiConfiguration } from "./MistralApiConfiguration.js";
import { failedMistralCallResponseHandler } from "./MistralError.js";

export interface MistralTextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;

  /**
   * The ID of the model to use for this request.
   */
  model: "mistral-embed";

  /**
   * The format of the output data.
   *
   * Default: "float"
   */
  encodingFormat?: "float";
}

export class MistralTextEmbeddingModel
  extends AbstractModel<MistralTextEmbeddingModelSettings>
  implements EmbeddingModel<string, MistralTextEmbeddingModelSettings>
{
  constructor(settings: MistralTextEmbeddingModelSettings) {
    super({ settings });
  }

  readonly provider = "mistral" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly maxValuesPerCall = 32;

  /**
   * Parallel calls are technically possible, but I have been hitting rate limits and disabled
   * them for now.
   */
  readonly isParallelizable = false;

  readonly embeddingDimensions = 1024;

  async callAPI(
    texts: Array<string>,
    options?: FunctionOptions
  ): Promise<MistralTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Mistral embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    const api = this.settings.api ?? new MistralApiConfiguration();
    const abortSignal = options?.run?.abortSignal;
    const model = this.settings.model;
    const encodingFormat = this.settings.encodingFormat ?? "float";

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/embeddings`),
          headers: api.headers,
          body: {
            model,
            input: texts,
            encoding_format: encodingFormat,
          },
          failedResponseHandler: failedMistralCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            MistralTextEmbeddingResponseSchema
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<MistralTextEmbeddingModelSettings> {
    return {
      encodingFormat: this.settings.encodingFormat,
    };
  }

  async doEmbedValues(texts: string[], options?: FunctionOptions) {
    const response = await this.callAPI(texts, options);

    return {
      response,
      embeddings: response.data.map((entry) => entry.embedding),
    };
  }

  withSettings(additionalSettings: Partial<MistralTextEmbeddingModelSettings>) {
    return new MistralTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const MistralTextEmbeddingResponseSchema = zodSchema(
  z.object({
    id: z.string(),
    object: z.string(),
    data: z.array(
      z.object({
        object: z.string(),
        embedding: z.array(z.number()),
        index: z.number(),
      })
    ),
    model: z.string(),
    usage: z.object({
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    }),
  })
);

export type MistralTextEmbeddingResponse =
  (typeof MistralTextEmbeddingResponseSchema)["_type"];
