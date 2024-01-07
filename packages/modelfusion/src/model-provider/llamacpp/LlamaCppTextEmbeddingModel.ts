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
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

export interface LlamaCppTextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;
  embeddingDimensions?: number;
  isParallelizable?: boolean;
}

export class LlamaCppTextEmbeddingModel
  extends AbstractModel<LlamaCppTextEmbeddingModelSettings>
  implements EmbeddingModel<string, LlamaCppTextEmbeddingModelSettings>
{
  constructor(settings: LlamaCppTextEmbeddingModelSettings = {}) {
    super({ settings });

    this.tokenizer = new LlamaCppTokenizer(this.settings.api);
  }

  readonly provider = "llamacpp" as const;
  get modelName() {
    return null;
  }

  readonly maxValuesPerCall = 1;
  get isParallelizable() {
    return this.settings.isParallelizable ?? false;
  }

  readonly contextWindowSize = undefined;
  get embeddingDimensions() {
    return this.settings.embeddingDimensions;
  }

  private readonly tokenizer: LlamaCppTokenizer;

  async tokenize(text: string) {
    return this.tokenizer.tokenize(text);
  }

  async callAPI(
    texts: Array<string>,
    callOptions: FunctionCallOptions
  ): Promise<LlamaCppTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Llama.cpp embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    const api = this.settings.api ?? new LlamaCppApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/embedding`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: { content: texts[0] },
          failedResponseHandler: failedLlamaCppCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(llamaCppTextEmbeddingResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<LlamaCppTextEmbeddingModelSettings> {
    return {
      embeddingDimensions: this.settings.embeddingDimensions,
    };
  }

  async doEmbedValues(texts: string[], options: FunctionCallOptions) {
    const rawResponse = await this.callAPI(texts, options);

    return {
      rawResponse,
      embeddings: [rawResponse.embedding],
    };
  }

  withSettings(
    additionalSettings: Partial<LlamaCppTextEmbeddingModelSettings>
  ) {
    return new LlamaCppTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const llamaCppTextEmbeddingResponseSchema = z.object({
  embedding: z.array(z.number()),
});

export type LlamaCppTextEmbeddingResponse = z.infer<
  typeof llamaCppTextEmbeddingResponseSchema
>;
