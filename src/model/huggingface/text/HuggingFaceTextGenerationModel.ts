import { createId } from "@paralleldrive/cuid2";
import { doGenerateText } from "../../../internal/doGenerateText.js";
import { PromptTemplate } from "../../../run/PromptTemplate.js";
import { RunContext } from "../../../run/RunContext.js";
import { RunObserver } from "../../../run/RunObserver.js";
import { TextGenerationModel } from "../../../text/generate/TextGenerationModel.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { callHuggingFaceTextGenerationAPI } from "./callHuggingFaceTextGenerationAPI.js";
import { HuggingFaceTextGenerationResponse } from "./HuggingFaceTextGenerationResponse.js";

export type HuggingFaceTextGenerationModelSettings = {
  model: string;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  observers?: Array<RunObserver>;
  uncaughtErrorHandler?: (error: unknown) => void;

  trimOutput?: boolean;

  topK?: number;
  topP?: number;
  temperature?: number;
  repetitionPenalty?: number;
  maxNewTokens?: number;
  maxTime?: number;
  numReturnSequences?: number;
  doSample?: boolean;
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
};

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const textGenerationModel = new HuggingFaceTextGenerationModel({
 *   model: "tiiuae/falcon-7b",
 *   temperature: 0.7,
 *   maxTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await model.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class HuggingFaceTextGenerationModel
  implements TextGenerationModel<string>
{
  readonly provider = "huggingface";

  readonly settings: HuggingFaceTextGenerationModelSettings;

  constructor(settings: HuggingFaceTextGenerationModelSettings) {
    this.settings = Object.assign({ trimOutput: true }, settings);
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.HUGGINGFACE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Hugging Face API key provided. Pass it in the constructor or set the HUGGINGFACE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  get model() {
    return this.settings.model;
  }

  get retry() {
    return this.settings.retry ?? retryWithExponentialBackoff();
  }

  get throttle() {
    return (
      this.settings.throttle ??
      throttleMaxConcurrency({ maxConcurrentCalls: 5 })
    );
  }

  get uncaughtErrorHandler() {
    return (
      this.settings.uncaughtErrorHandler ??
      ((error) => {
        console.error(error);
      })
    );
  }

  async generate(
    prompt: string,
    context?: RunContext
  ): Promise<HuggingFaceTextGenerationResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callHuggingFaceTextGenerationAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          inputs: prompt,
          ...this.settings,
          options: this.settings.options ?? {
            useCache: true,
            waitForModel: true,
          },
        })
      )
    );
  }

  async generateText(prompt: string, context?: RunContext): Promise<string> {
    return await doGenerateText({
      prompt,
      generate: () => this.generate(prompt, context),
      extractText: async (response) => {
        const text = response[0].generated_text;
        return this.settings.trimOutput ? text.trim() : text;
      },
      model: { provider: this.provider, name: this.model },
      createId,
      uncaughtErrorHandler: this.uncaughtErrorHandler,
      observers: this.settings.observers,
      context,
    });
  }

  generateTextAsFunction<INPUT>(promptTemplate: PromptTemplate<INPUT, string>) {
    return async (input: INPUT, context?: RunContext) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateText(expandedPrompt, context);
    };
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextGenerationModelSettings>
  ) {
    return new HuggingFaceTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    );
  }
}
