import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "../../model-function/embed-text/TextEmbeddingModel.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    contextWindowSize: 8192,
    embeddingDimensions: 1536,
    tokenCostInMillicents: 0.01,
  },
};

export type OpenAITextEmbeddingModelType =
  keyof typeof OPENAI_TEXT_EMBEDDING_MODELS;

export const isOpenAIEmbeddingModel = (
  model: string
): model is OpenAITextEmbeddingModelType =>
  model in OPENAI_TEXT_EMBEDDING_MODELS;

export const calculateOpenAIEmbeddingCostInMillicents = ({
  model,
  responses,
}: {
  model: OpenAITextEmbeddingModelType;
  responses: OpenAITextEmbeddingResponse[];
}): number => {
  let amountInMilliseconds = 0;

  for (const response of responses) {
    amountInMilliseconds +=
      response.usage.total_tokens *
      OPENAI_TEXT_EMBEDDING_MODELS[model].tokenCostInMillicents;
  }

  return amountInMilliseconds;
};

export interface OpenAITextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  api?: ApiConfiguration;
  model: OpenAITextEmbeddingModelType;
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const embeddings = await embedTexts(
 *   new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export class OpenAITextEmbeddingModel
  extends AbstractModel<OpenAITextEmbeddingModelSettings>
  implements
    TextEmbeddingModel<
      OpenAITextEmbeddingResponse,
      OpenAITextEmbeddingModelSettings
    >
{
  constructor(settings: OpenAITextEmbeddingModelSettings) {
    super({ settings });

    this.tokenizer = new TikTokenTokenizer({ model: this.modelName });
    this.contextWindowSize =
      OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].contextWindowSize;

    this.embeddingDimensions =
      OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].embeddingDimensions;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly maxTextsPerCall = 2048;

  readonly embeddingDimensions: number;

  readonly tokenizer: TikTokenTokenizer;
  readonly contextWindowSize: number;

  async countTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  async callAPI(
    texts: Array<string>,
    options?: ModelFunctionOptions<OpenAITextEmbeddingModelSettings>
  ): Promise<OpenAITextEmbeddingResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,

      // Copied settings:
      ...combinedSettings,

      // other settings:
      abortSignal: run?.abortSignal,
      input: texts,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callOpenAITextEmbeddingAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<OpenAITextEmbeddingModelSettings> {
    return {};
  }

  generateEmbeddingResponse(
    texts: string[],
    options?: ModelFunctionOptions<OpenAITextEmbeddingModelSettings>
  ) {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The OpenAI embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    return this.callAPI(texts, options);
  }

  extractEmbeddings(response: OpenAITextEmbeddingResponse) {
    return response.data.map((data) => data.embedding);
  }

  withSettings(additionalSettings: OpenAITextEmbeddingModelSettings) {
    return new OpenAITextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const openAITextEmbeddingResponseSchema = z.object({
  object: z.literal("list"),
  data: z.array(
    z.object({
      object: z.literal("embedding"),
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

export type OpenAITextEmbeddingResponse = z.infer<
  typeof openAITextEmbeddingResponseSchema
>;

async function callOpenAITextEmbeddingAPI({
  api = new OpenAIApiConfiguration(),
  abortSignal,
  model,
  input,
  user,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: OpenAITextEmbeddingModelType;
  input: Array<string>;
  user?: string;
}): Promise<OpenAITextEmbeddingResponse> {
  return postJsonToApi({
    url: api.assembleUrl("/embeddings"),
    headers: api.headers,
    body: {
      model,
      input,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      openAITextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
