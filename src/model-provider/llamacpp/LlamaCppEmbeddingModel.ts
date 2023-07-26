import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../../model-function/embed-text/TextEmbeddingModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

export interface LlamaCppEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  baseUrl?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  tokenizerSettings?: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  };
}

export class LlamaCppTextEmbeddingModel
  extends AbstractModel<LlamaCppEmbeddingModelSettings>
  implements
    TextEmbeddingModel<
      LlamaCppTextEmbeddingResponse,
      LlamaCppEmbeddingModelSettings
    >
{
  constructor(settings: LlamaCppEmbeddingModelSettings = {}) {
    super({ settings });

    this.tokenizer = new LlamaCppTokenizer({
      baseUrl: this.settings.baseUrl,
      retry: this.settings.tokenizerSettings?.retry,
      throttle: this.settings.tokenizerSettings?.throttle,
    });
  }

  readonly provider = "llamacpp" as const;
  get modelName() {
    return null;
  }

  readonly maxTextsPerCall = 1;

  readonly maxTokens = undefined;
  readonly embeddingDimensions = undefined;

  private readonly tokenizer: LlamaCppTokenizer;

  async tokenize(text: string) {
    return this.tokenizer.tokenize(text);
  }

  async callAPI(
    texts: Array<string>,
    options?: FunctionOptions<LlamaCppEmbeddingModelSettings>
  ): Promise<LlamaCppTextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The Llama.cpp embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign({}, this.settings, settings, {
      abortSignal: run?.abortSignal,
      content: texts[0],
    });

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callLlamaCppEmbeddingAPI(callSettings),
    });
  }

  generateEmbeddingResponse(
    texts: string[],
    options?: FunctionOptions<LlamaCppEmbeddingModelSettings>
  ) {
    return this.callAPI(texts, options);
  }

  extractEmbeddings(response: LlamaCppTextEmbeddingResponse) {
    return [response.embedding];
  }

  withSettings(additionalSettings: Partial<LlamaCppEmbeddingModelSettings>) {
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
  baseUrl = "http://127.0.0.1:8080",
  abortSignal,
  content,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  content: string;
}): Promise<LlamaCppTextEmbeddingResponse> {
  return postJsonToApi({
    url: `${baseUrl}/embedding`,
    body: { content },
    failedResponseHandler: failedLlamaCppCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      llamaCppTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
