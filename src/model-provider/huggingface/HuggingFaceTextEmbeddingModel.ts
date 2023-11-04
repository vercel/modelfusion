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
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceTextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;

  model: string;

  maxValuesPerCall?: number;
  embeddingDimensions?: number;

  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}

/**
 * Create a text embedding model that calls a Hugging Face Inference API Feature Extraction Task.
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
 * const embeddings = await embedMany(
 *   model,
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export class HuggingFaceTextEmbeddingModel
  extends AbstractModel<HuggingFaceTextEmbeddingModelSettings>
  implements EmbeddingModel<string, HuggingFaceTextEmbeddingModelSettings>
{
  constructor(settings: HuggingFaceTextEmbeddingModelSettings) {
    super({ settings });

    // There is no limit documented in the HuggingFace API. Use 1024 as a reasonable default.
    this.maxValuesPerCall = settings.maxValuesPerCall ?? 1024;
    this.embeddingDimensions = settings.embeddingDimensions;
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  readonly maxValuesPerCall;
  readonly isParallizable = true;

  readonly contextWindowSize = undefined;
  readonly embeddingDimensions;

  readonly tokenizer = undefined;

  async callAPI(
    texts: Array<string>,
    options?: FunctionOptions
  ): Promise<HuggingFaceTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The HuggingFace feature extraction API is configured to only support ${this.maxValuesPerCall} texts per API call.`
      );
    }

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callHuggingFaceTextGenerationAPI({
          options: {
            useCache: true,
            waitForModel: true,
          },
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          inputs: texts,
        }),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceTextEmbeddingModelSettings> {
    return {
      embeddingDimensions: this.settings.embeddingDimensions,
      options: this.settings.options,
    };
  }

  readonly countPromptTokens = undefined;

  async doEmbedValues(texts: string[], options?: FunctionOptions) {
    const response = await this.callAPI(texts, options);

    return {
      response,
      embeddings: response,
    };
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
  api = new HuggingFaceApiConfiguration(),
  abortSignal,
  model,
  inputs,
  options,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: string;
  inputs: string[];
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}): Promise<HuggingFaceTextEmbeddingResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/${model}`),
    headers: api.headers,
    body: {
      inputs,
      options: options
        ? {
            use_cache: options?.useCache,
            wait_for_model: options?.waitForModel,
          }
        : {},
    },
    failedResponseHandler: failedHuggingFaceCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      huggingFaceTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
