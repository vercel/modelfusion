import z from "zod";
import { AbstractModel } from "../../model/AbstractModel.js";
import { FunctionOptions } from "../../model/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model/text-generation/TextGenerationModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";

export interface LlamaCppTextGenerationModelSettings
  extends TextGenerationModelSettings {
  baseUrl?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  nPredict?: number;
}

export class LlamaCppTextGenerationModel
  extends AbstractModel<LlamaCppTextGenerationModelSettings>
  implements
    TextGenerationModel<
      string,
      LlamaCppTextGenerationResponse,
      LlamaCppTextGenerationModelSettings
    >
{
  constructor(settings: LlamaCppTextGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "llamacpp";
  get modelName() {
    return null;
  }

  async callAPI(
    prompt: string,
    options?: FunctionOptions<LlamaCppTextGenerationModelSettings>
  ): Promise<LlamaCppTextGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(this.settings, settings, {
      abortSignal: run?.abortSignal,
      prompt,
    });

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callLlamaCppTextGenerationAPI(callSettings),
    });
  }

  generateTextResponse(
    prompt: string,
    options?: FunctionOptions<LlamaCppTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, options);
  }

  extractText(response: LlamaCppTextGenerationResponse): string {
    return response.content;
  }

  withSettings(
    additionalSettings: Partial<LlamaCppTextGenerationModelSettings>
  ) {
    return new LlamaCppTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const llamaCppTextGenerationResponseSchema = z.object({
  content: z.string(),
  generation_settings: z.object({
    frequency_penalty: z.number(),
    ignore_eos: z.boolean(),
    logit_bias: z.array(z.number()),
    mirostat: z.number(),
    mirostat_eta: z.number(),
    mirostat_tau: z.number(),
    model: z.string(),
    n_ctx: z.number(),
    n_keep: z.number(),
    n_predict: z.number(),
    n_probs: z.number(),
    penalize_nl: z.boolean(),
    presence_penalty: z.number(),
    repeat_last_n: z.number(),
    repeat_penalty: z.number(),
    seed: z.number(),
    stop: z.array(z.string()),
    stream: z.boolean(),
    temp: z.number(),
    tfs_z: z.number(),
    top_k: z.number(),
    top_p: z.number(),
    typical_p: z.number(),
  }),
  model: z.string(),
  prompt: z.string(),
  stop: z.boolean(),
  stopped_eos: z.boolean(),
  stopped_limit: z.boolean(),
  stopped_word: z.boolean(),
  stopping_word: z.string(),
  timings: z.object({
    predicted_ms: z.number(),
    predicted_n: z.number(),
    predicted_per_second: z.number(),
    predicted_per_token_ms: z.number(),
    prompt_ms: z.number(),
    prompt_n: z.number(),
    prompt_per_second: z.number().nullable(),
    prompt_per_token_ms: z.number(),
  }),
  tokens_cached: z.number(),
  tokens_evaluated: z.number(),
  tokens_predicted: z.number(),
  truncated: z.boolean(),
});

export type LlamaCppTextGenerationResponse = z.infer<
  typeof llamaCppTextGenerationResponseSchema
>;

async function callLlamaCppTextGenerationAPI({
  baseUrl = "http://127.0.0.1:8080",
  abortSignal,
  prompt,
  nPredict,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  prompt: string;
  nPredict?: number;
}): Promise<LlamaCppTextGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/completion`,
    body: {
      prompt,
      n_predict: nPredict,
    },
    failedResponseHandler: failedLlamaCppCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      llamaCppTextGenerationResponseSchema
    ),
    abortSignal,
  });
}
