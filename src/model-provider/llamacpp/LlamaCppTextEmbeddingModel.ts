import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../../model-function/embed-text/TextEmbeddingModel.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

export interface LlamaCppTextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  api?: ApiConfiguration;
  embeddingDimensions?: number;
}

export class LlamaCppTextEmbeddingModel
  extends AbstractModel<LlamaCppTextEmbeddingModelSettings>
  implements
    TextEmbeddingModel<
      LlamaCppTextEmbeddingResponse,
      LlamaCppTextEmbeddingModelSettings
    >
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

  readonly maxTextsPerCall = 1;

  readonly contextWindowSize = undefined;
  readonly embeddingDimensions;

  private readonly tokenizer: LlamaCppTokenizer;

  async tokenize(text: string) {
    return this.tokenizer.tokenize(text);
  }

  async callAPI(
    texts: Array<string>,
    options?: ModelFunctionOptions<LlamaCppTextEmbeddingModelSettings>
  ): Promise<LlamaCppTextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The Llama.cpp embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    const run = options?.run;
    const settings = options?.settings;

    const callSettings = {
      ...this.settings,
      ...settings,

      abortSignal: run?.abortSignal,
      content: texts[0],
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callLlamaCppEmbeddingAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<LlamaCppTextEmbeddingModelSettings> {
    return {
      embeddingDimensions: this.settings.embeddingDimensions,
    };
  }

  generateEmbeddingResponse(
    texts: string[],
    options?: ModelFunctionOptions<LlamaCppTextEmbeddingModelSettings>
  ) {
    return this.callAPI(texts, options);
  }

  extractEmbeddings(response: LlamaCppTextEmbeddingResponse) {
    return [response.embedding];
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
