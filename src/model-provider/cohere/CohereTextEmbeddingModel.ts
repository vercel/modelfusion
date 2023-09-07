import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ApiConfiguration } from "../../model-function/ApiConfiguration.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../../model-function/embed-text/TextEmbeddingModel.js";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTokenizer } from "./CohereTokenizer.js";

export const COHERE_TEXT_EMBEDDING_MODELS = {
  "embed-english-light-v2.0": {
    contextWindowSize: 4096,
    embeddingDimensions: 1024,
  },
  "embed-english-v2.0": {
    contextWindowSize: 4096,
    embeddingDimensions: 4096,
  },
  "embed-multilingual-v2.0": {
    contextWindowSize: 4096,
    embeddingDimensions: 768,
  },
};

export type CohereTextEmbeddingModelType =
  keyof typeof COHERE_TEXT_EMBEDDING_MODELS;

export interface CohereTextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  api?: ApiConfiguration;
  model: CohereTextEmbeddingModelType;
  truncate?: "NONE" | "START" | "END";
}

/**
 * Create a text embedding model that calls the Cohere Co.Embed API.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const embeddings = await embedTexts(
 *   new CohereTextEmbeddingModel({ model: "embed-english-light-v2.0" }),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export class CohereTextEmbeddingModel
  extends AbstractModel<CohereTextEmbeddingModelSettings>
  implements
    TextEmbeddingModel<
      CohereTextEmbeddingResponse,
      CohereTextEmbeddingModelSettings
    >,
    FullTokenizer
{
  constructor(settings: CohereTextEmbeddingModelSettings) {
    super({ settings });

    this.contextWindowSize =
      COHERE_TEXT_EMBEDDING_MODELS[this.modelName].contextWindowSize;

    this.tokenizer = new CohereTokenizer({
      api: this.settings.api,
      model: this.settings.model,
    });

    this.embeddingDimensions =
      COHERE_TEXT_EMBEDDING_MODELS[this.modelName].embeddingDimensions;
  }

  readonly provider = "cohere" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly maxTextsPerCall = 96;
  readonly embeddingDimensions: number;

  readonly contextWindowSize: number;
  private readonly tokenizer: CohereTokenizer;

  async tokenize(text: string) {
    return this.tokenizer.tokenize(text);
  }

  async tokenizeWithTexts(text: string) {
    return this.tokenizer.tokenizeWithTexts(text);
  }

  async detokenize(tokens: number[]) {
    return this.tokenizer.detokenize(tokens);
  }

  async callAPI(
    texts: Array<string>,
    options?: ModelFunctionOptions<CohereTextEmbeddingModelSettings>
  ): Promise<CohereTextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The Cohere embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    const run = options?.run;
    const settings = options?.settings;

    const callSettings = {
      ...this.settings,
      ...settings,
      abortSignal: run?.abortSignal,
      texts,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callCohereEmbeddingAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<CohereTextEmbeddingModelSettings> {
    return {
      truncate: this.settings.truncate,
    };
  }

  generateEmbeddingResponse(
    texts: string[],
    options?: ModelFunctionOptions<CohereTextEmbeddingModelSettings>
  ) {
    return this.callAPI(texts, options);
  }

  extractEmbeddings(response: CohereTextEmbeddingResponse) {
    return response.embeddings;
  }

  withSettings(additionalSettings: Partial<CohereTextEmbeddingModelSettings>) {
    return new CohereTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const cohereTextEmbeddingResponseSchema = z.object({
  id: z.string(),
  texts: z.array(z.string()),
  embeddings: z.array(z.array(z.number())),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTextEmbeddingResponse = z.infer<
  typeof cohereTextEmbeddingResponseSchema
>;

async function callCohereEmbeddingAPI({
  api = new CohereApiConfiguration(),
  abortSignal,
  model,
  texts,
  truncate,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: CohereTextEmbeddingModelType;
  texts: string[];
  truncate?: "NONE" | "START" | "END";
}): Promise<CohereTextEmbeddingResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/embed`),
    headers: api.headers,
    body: {
      model,
      texts,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
