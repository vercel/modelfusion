import { RunContext } from "../../../run/RunContext.js";
import { TextGenerationModelWithTokenization } from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { TikTokenTokenizer } from "../tokenizer/TikTokenTokenizer.js";
import { callOpenAITextGenerationAPI } from "./callOpenAITextGenerationAPI.js";
import { runSafe } from "../../../util/runSafe.js";
import { AbortError } from "../../../util/AbortError.js";
import { PromptTemplate } from "../../../run/PromptTemplate.js";
import { OpenAITextGenerationResponse } from "./OpenAITextGenerationResponse.js";

// see https://platform.openai.com/docs/models/
export const OPENAI_TEXT_GENERATION_MODELS = {
  "text-davinci-003": {
    maxTokens: 4096,
  },
  "text-davinci-002": {
    maxTokens: 4096,
  },
  "code-davinci-002": {
    maxTokens: 8000,
  },
  "text-curie-001": {
    maxTokens: 2048,
  },
  "text-babbage-001": {
    maxTokens: 2048,
  },
  "text-ada-001": {
    maxTokens: 2048,
  },
  davinci: {
    maxTokens: 2048,
  },
  curie: {
    maxTokens: 2048,
  },
  babbage: {
    maxTokens: 2048,
  },
  ada: {
    maxTokens: 2048,
  },
};

export type OpenAITextGenerationModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAITextGenerationModelSettings = {
  model: OpenAITextGenerationModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  trimOutput?: boolean;

  isUserIdForwardingEnabled?: boolean;

  suffix?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
};

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAITextGenerationModel({
 *   model: "text-davinci-003",
 *   temperature: 0.7,
 *   maxTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await model.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class OpenAITextGenerationModel
  implements
    TextGenerationModelWithTokenization<string, OpenAITextGenerationResponse>
{
  readonly provider = "openai";

  readonly settings: OpenAITextGenerationModelSettings;

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  constructor(settings: OpenAITextGenerationModelSettings) {
    this.settings = Object.assign(
      {
        processText: (text: string) => text.trim(),
        trimOutput: true,
      },
      settings
    );

    this.tokenizer = TikTokenTokenizer.forModel({ model: settings.model });
    this.maxTokens = OPENAI_TEXT_GENERATION_MODELS[settings.model].maxTokens;
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
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

  async countPromptTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async generate(
    prompt: string,
    context?: RunContext
  ): Promise<OpenAITextGenerationResponse> {
    // TODO add logging etc

    return this.retry(async () =>
      this.throttle(async () =>
        callOpenAITextGenerationAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          prompt,
          user: this.settings.isUserIdForwardingEnabled
            ? context?.userId
            : undefined,
          ...this.settings, // TODO only send actual settings
        })
      )
    );
  }

  async extractText(rawOutput: OpenAITextGenerationResponse): Promise<string> {
    const text = rawOutput.choices[0]!.text;
    return this.settings.trimOutput ? text.trim() : text;
  }

  async generateText(prompt: string, context?: RunContext): Promise<string> {
    const result = await runSafe(() => this.generate(prompt, context));

    if (!result.ok) {
      if (result.isAborted) {
        // const endEvent: GenerateTextEndEvent = {
        //   type: "generate-text-end",
        //   status: "abort",
        //   metadata,
        //   input: expandedPrompt,
        // };

        // onEnd?.(endEvent);
        // context?.onGenerateTextEnd?.(endEvent);

        throw new AbortError();
      }

      // const endEvent: GenerateTextEndEvent = {
      //   type: "generate-text-end",
      //   status: "failure",
      //   metadata,
      //   input: expandedPrompt,
      //   error: result.error,
      // };

      // onEnd?.(endEvent);
      // context?.onGenerateTextEnd?.(endEvent);

      // TODO instead throw a generate text error with a cause
      throw result.error;
    }

    const extractedText = await this.extractText(result.output);

    return extractedText;
  }

  generateTextAsFunction<INPUT>(promptTemplate: PromptTemplate<INPUT, string>) {
    return async (input: INPUT, context?: RunContext) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateText(expandedPrompt, context);
    };
  }

  withSettings(additionalSettings: Partial<OpenAITextGenerationModelSettings>) {
    return new OpenAITextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    );
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}
