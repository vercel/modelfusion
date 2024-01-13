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
import { EmbeddingModelSettings } from "../../model-function/embed/EmbeddingModel.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";

export interface AbstractOpenAITextEmbeddingModelSettings
  extends EmbeddingModelSettings {
  api?: ApiConfiguration;

  model: string;

  maxValuesPerCall?: number | undefined;
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Abstract text embedding model that calls an API that is compatible with the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 */
export abstract class AbstractOpenAITextEmbeddingModel<
  SETTINGS extends AbstractOpenAITextEmbeddingModelSettings,
> extends AbstractModel<SETTINGS> {
  constructor(settings: SETTINGS) {
    super({ settings });
  }

  get maxValuesPerCall() {
    return this.settings.maxValuesPerCall ?? 2048;
  }

  readonly isParallelizable = true;

  async callAPI(
    texts: Array<string>,
    callOptions: FunctionCallOptions
  ): Promise<OpenAITextEmbeddingResponse> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl("/embeddings"),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            model: this.modelName,
            input: texts,
            user: this.settings.isUserIdForwardingEnabled
              ? callOptions.run?.userId
              : undefined,
          },
          failedResponseHandler: failedOpenAICallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(openAITextEmbeddingResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  async doEmbedValues(texts: string[], callOptions: FunctionCallOptions) {
    if (texts.length > this.maxValuesPerCall) {
      throw new Error(
        `The OpenAI embedding API only supports ${this.maxValuesPerCall} texts per API call.`
      );
    }

    const rawResponse = await this.callAPI(texts, callOptions);

    return {
      rawResponse,
      embeddings: rawResponse.data.map((data) => data.embedding),
    };
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
  usage: z
    .object({
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(), // for openai-compatible models
});

export type OpenAITextEmbeddingResponse = z.infer<
  typeof openAITextEmbeddingResponseSchema
>;
