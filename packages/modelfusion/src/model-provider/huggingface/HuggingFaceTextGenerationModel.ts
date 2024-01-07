import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { validateTypes } from "../../core/schema/validateTypes.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { PromptTemplateTextGenerationModel } from "../../model-function/generate-text/PromptTemplateTextGenerationModel.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;

  topK?: number;
  topP?: number;
  temperature?: number;
  repetitionPenalty?: number;
  maxTime?: number;
  doSample?: boolean;
}

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const model = new HuggingFaceTextGenerationModel({
 *   model: "tiiuae/falcon-7b",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class HuggingFaceTextGenerationModel
  extends AbstractModel<HuggingFaceTextGenerationModelSettings>
  implements
    TextGenerationModel<string, HuggingFaceTextGenerationModelSettings>
{
  constructor(settings: HuggingFaceTextGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  async callAPI(
    prompt: string,
    callOptions: FunctionCallOptions
  ): Promise<HuggingFaceTextGenerationResponse> {
    const api = this.settings.api ?? new HuggingFaceApiConfiguration();
    const abortSignal = callOptions?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/${this.settings.model}`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            inputs: prompt,
            top_k: this.settings.topK,
            top_p: this.settings.topP,
            temperature: this.settings.temperature,
            repetition_penalty: this.settings.repetitionPenalty,
            max_new_tokens: this.settings.maxGenerationTokens,
            max_time: this.settings.maxTime,
            num_return_sequences: this.settings.numberOfGenerations,
            do_sample: this.settings.doSample,
            options: {
              use_cache: true,
              wait_for_model: true,
            },
          },
          failedResponseHandler: failedHuggingFaceCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(huggingFaceTextGenerationResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "topK",
      "topP",
      "temperature",
      "repetitionPenalty",
      "maxTime",
      "doSample",
    ] satisfies (keyof HuggingFaceTextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(prompt: string, options: FunctionCallOptions) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options)
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        structure: rawResponse,
        schema: zodSchema(huggingFaceTextGenerationResponseSchema),
      })
    );
  }

  processTextGenerationResponse(
    rawResponse: HuggingFaceTextGenerationResponse
  ) {
    return {
      rawResponse,
      textGenerationResults: rawResponse.map((response) => ({
        text: response.generated_text,
        finishReason: "unknown" as const,
      })),
    };
  }

  withJsonOutput(): this {
    return this;
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextGenerationModel<
    INPUT_PROMPT,
    string,
    HuggingFaceTextGenerationModelSettings,
    this
  > {
    return new PromptTemplateTextGenerationModel({
      model: this, // stop tokens are not supported by this model
      promptTemplate,
    });
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextGenerationModelSettings>
  ) {
    return new HuggingFaceTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const huggingFaceTextGenerationResponseSchema = z.array(
  z.object({
    generated_text: z.string(),
  })
);

export type HuggingFaceTextGenerationResponse = z.infer<
  typeof huggingFaceTextGenerationResponseSchema
>;
