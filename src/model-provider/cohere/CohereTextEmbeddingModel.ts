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
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTokenizer } from "./CohereTokenizer.js";

export const COHERE_TEXT_EMBEDDING_MODELS = {
  "embed-english-light-v2.0": {
    contextWindowSize: 512,
    embeddingDimensions: 1024,
  },
  "embed-english-v2.0": {
    contextWindowSize: 512,
    embeddingDimensions: 4096,
  },
  "embed-multilingual-v2.0": {
    contextWindowSize: 512,
    embeddingDimensions: 768,
  },
  "embed-english-v3.0": {
    contextWindowSize: 512,
    embeddingDimensions: 1024,
  },
  "embed-english-light-v3.0": {
    contextWindowSize: 512,
    embeddingDimensions: 384,
  },
  "embed-multilingual-v3.0": {
    contextWindowSize: 512,
    embeddingDimensions: 1024,
  },
  "embed-multilingual-light-v3.0": {
    contextWindowSize: 512,
    embeddingDimensions: 384,
  },
};

export type CohereTextEmbeddingModelType =
  keyof typeof COHERE_TEXT_EMBEDDING_MODELS;

export interface CohereTextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;
  model: CohereTextEmbeddingModelType;
  inputType?:
    | "search_document"
    | "search_query"
    | "classification"
    | "clustering";
  truncate?: "NONE" | "START" | "END";
}

/**
 * Create a text embedding model that calls the Cohere Co.Embed API.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const embeddings = await embedMany(
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
    EmbeddingModel<string, CohereTextEmbeddingModelSettings>,
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

  readonly maxValuesPerCall = 96;
  readonly isParallizable = true;
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
    options?: FunctionOptions
  ): Promise<CohereTextEmbeddingResponse> {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The Cohere embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callCohereEmbeddingAPI({
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          texts,
        }),
    });
  }

  get settingsForEvent(): Partial<CohereTextEmbeddingModelSettings> {
    return {
      truncate: this.settings.truncate,
    };
  }

  async doEmbedValues(texts: string[], options?: FunctionOptions) {
    const response = await this.callAPI(texts, options);
    return {
      response,
      embeddings: response.embeddings,
    };
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
  inputType,
  truncate,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: CohereTextEmbeddingModelType;
  texts: string[];
  inputType?: CohereTextEmbeddingModelSettings["inputType"];
  truncate?: CohereTextEmbeddingModelSettings["truncate"];
}): Promise<CohereTextEmbeddingResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/embed`),
    headers: api.headers,
    body: {
      model,
      texts,
      input_type: inputType,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
