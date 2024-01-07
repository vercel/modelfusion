import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
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
    callOptions: FunctionCallOptions
  ): Promise<MistralTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Mistral embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    const api = this.settings.api ?? new MistralApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;
    const model = this.settings.model;
    const encodingFormat = this.settings.encodingFormat ?? "float";

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/embeddings`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            model,
            input: texts,
            encoding_format: encodingFormat,
          },
          failedResponseHandler: failedMistralCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(MistralTextEmbeddingResponseSchema)
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

  async doEmbedValues(texts: string[], options: FunctionCallOptions) {
    const rawResponse = await this.callAPI(texts, options);

    return {
      rawResponse,
      embeddings: rawResponse.data.map((entry) => entry.embedding),
    };
  }

  withSettings(additionalSettings: Partial<MistralTextEmbeddingModelSettings>) {
    return new MistralTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const MistralTextEmbeddingResponseSchema = z.object({
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
});

export type MistralTextEmbeddingResponse = z.infer<
  typeof MistralTextEmbeddingResponseSchema
>;
