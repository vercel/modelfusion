import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
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
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceTextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  model: string;

  baseUrl?: string;
  apiKey?: string;

  maxTextsPerCall?: number;
  embeddingDimensions?: number;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}

/**
 * Create a text embeddinng model that calls a Hugging Face Inference API Feature Extraction Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#feature-extraction-task
 *
 * @example
 * const model = new HuggingFaceTextGenerationModel({
 *   model: "intfloat/e5-base-v2",
 *   maxTexstsPerCall: 5,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const embeddings = await embedTexts(
 *   model,
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export class HuggingFaceTextEmbeddingModel
  extends AbstractModel<HuggingFaceTextEmbeddingModelSettings>
  implements
    TextEmbeddingModel<
      HuggingFaceTextEmbeddingResponse,
      HuggingFaceTextEmbeddingModelSettings
    >
{
  constructor(settings: HuggingFaceTextEmbeddingModelSettings) {
    super({ settings });

    // There is no limit documented in the HuggingFace API. Use 1024 as a reasonable default.
    this.maxTextsPerCall = settings.maxTextsPerCall ?? 1024;
    this.embeddingDimensions = settings.embeddingDimensions;
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  readonly maxTextsPerCall;

  readonly contextWindowSize = undefined;
  readonly embeddingDimensions;

  readonly tokenizer = undefined;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.HUGGINGFACE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Hugging Face API key provided. Pass it in the constructor or set the HUGGINGFACE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  async callAPI(
    texts: Array<string>,
    options?: ModelFunctionOptions<HuggingFaceTextEmbeddingModelSettings>
  ): Promise<HuggingFaceTextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The HuggingFace feature extraction API is configured to only support ${this.maxTextsPerCall} texts per API call.`
      );
    }

    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
        options: {
          useCache: true,
          waitForModel: true,
        },
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        inputs: texts,
      }
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callHuggingFaceTextGenerationAPI(callSettings),
    });
  }

  readonly countPromptTokens = undefined;

  generateEmbeddingResponse(
    texts: string[],
    options?: ModelFunctionOptions<HuggingFaceTextEmbeddingModelSettings>
  ) {
    return this.callAPI(texts, options);
  }

  extractEmbeddings(response: HuggingFaceTextEmbeddingResponse) {
    return response;
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextEmbeddingModelSettings>
  ) {
    return new HuggingFaceTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const huggingFaceTextEmbeddingResponseSchema = z.array(z.array(z.number()));

export type HuggingFaceTextEmbeddingResponse = z.infer<
  typeof huggingFaceTextEmbeddingResponseSchema
>;

async function callHuggingFaceTextGenerationAPI({
  baseUrl = "https://api-inference.huggingface.co/pipeline/feature-extraction",
  abortSignal,
  apiKey,
  model,
  inputs,
  options,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: string;
  inputs: string[];
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}): Promise<HuggingFaceTextEmbeddingResponse> {
  return postJsonToApi({
    url: `${baseUrl}/${model}`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      inputs,
      options: options
        ? {
            use_cache: options?.useCache,
            wait_for_model: options?.waitForModel,
          }
        : undefined,
    },
    failedResponseHandler: failedHuggingFaceCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      huggingFaceTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
