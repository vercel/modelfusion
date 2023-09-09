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
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";

export interface HuggingFaceTextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  api?: ApiConfiguration;

  model: string;

  maxTextsPerCall?: number;
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

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      options: {
        useCache: true,
        waitForModel: true,
      },
      ...combinedSettings,
      abortSignal: run?.abortSignal,
      inputs: texts,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callHuggingFaceTextGenerationAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceTextEmbeddingModelSettings> {
    return {
      embeddingDimensions: this.settings.embeddingDimensions,
      options: this.settings.options,
    };
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
