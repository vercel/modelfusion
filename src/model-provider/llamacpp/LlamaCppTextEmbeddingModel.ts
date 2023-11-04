import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
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
  isParallizable?: boolean;
}

export class LlamaCppTextEmbeddingModel
  extends AbstractModel<LlamaCppTextEmbeddingModelSettings>
  implements EmbeddingModel<string, LlamaCppTextEmbeddingModelSettings>
{
  constructor(settings: LlamaCppTextEmbeddingModelSettings = {}) {
    super({ settings });

    this.tokenizer = new LlamaCppTokenizer(this.settings.api);
    this.embeddingDimensions = this.settings.embeddingDimensions;
  }

  readonly provider = "llamacpp" as const;
  get modelName() {
    return null;
  }

  readonly maxValuesPerCall = 1;
  get isParallizable() {
    return this.settings.isParallizable ?? false;
  }

  readonly contextWindowSize = undefined;
  readonly embeddingDimensions;

  private readonly tokenizer: LlamaCppTokenizer;

  async tokenize(text: string) {
    return this.tokenizer.tokenize(text);
  }

  async callAPI(
    texts: Array<string>,
    options?: FunctionOptions
  ): Promise<LlamaCppTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Llama.cpp embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callLlamaCppEmbeddingAPI({
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          content: texts[0],
        }),
    });
  }

  get settingsForEvent(): Partial<LlamaCppTextEmbeddingModelSettings> {
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

async function callLlamaCppEmbeddingAPI({
  api = new LlamaCppApiConfiguration(),
  abortSignal,
  content,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  content: string;
}): Promise<LlamaCppTextEmbeddingResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/embedding`),
    headers: api.headers,
    body: { content },
    failedResponseHandler: failedLlamaCppCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      llamaCppTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
