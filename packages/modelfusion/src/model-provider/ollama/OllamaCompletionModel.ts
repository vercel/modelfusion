import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import { ResponseHandler, postJsonToApi } from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { safeParseJSON } from "../../core/schema/parseJSON.js";
import { validateTypes } from "../../core/schema/validateTypes.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import {
  FlexibleStructureFromTextPromptTemplate,
  StructureFromTextPromptTemplate,
} from "../../model-function/generate-structure/StructureFromTextPromptTemplate.js";
import { StructureFromTextStreamingModel } from "../../model-function/generate-structure/StructureFromTextStreamingModel.js";
import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ChatPrompt } from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { TextGenerationPromptTemplateProvider } from "../../model-function/generate-text/prompt-template/PromptTemplateProvider.js";
import {
  TextGenerationToolCallModel,
  ToolCallPromptTemplate,
} from "../../tool/generate-tool-call/TextGenerationToolCallModel.js";
import { TextGenerationToolCallsModel } from "../../tool/generate-tool-calls/TextGenerationToolCallsModel.js";
import { ToolCallsPromptTemplate } from "../../tool/generate-tool-calls/ToolCallsPromptTemplate.js";
import { createJsonStreamResponseHandler } from "../../util/streaming/createJsonStreamResponseHandler.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { Text } from "./OllamaCompletionPrompt.js";
import { failedOllamaCallResponseHandler } from "./OllamaError.js";
import { OllamaTextGenerationSettings } from "./OllamaTextGenerationSettings.js";

export interface OllamaCompletionPrompt {
  /**
   * Text prompt.
   */
  prompt: string;

  /**
   Images. Supports base64-encoded `png` and `jpeg` images up to 100MB in size.
   */
  images?: Array<string>;
}

/**
 * Text generation model that uses the Ollama completion API.
 *
 * @see https://github.com/jmorganca/ollama/blob/main/docs/api.md#generate-a-completion
 */
export interface OllamaCompletionModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends OllamaTextGenerationSettings {
  api?: ApiConfiguration;

  /**
   * Specify the context window size of the model that you have loaded in your
   * Ollama server. (Default: 2048)
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  /**
   * When set to true, no formatting will be applied to the prompt and no context
   * will be returned.
   */
  raw?: boolean;

  system?: string;
  context?: number[];

  /**
   * Prompt template provider that is used when calling `.withTextPrompt()`, `withInstructionPrompt()` or `withChatPrompt()`.
   */
  promptTemplate?: TextGenerationPromptTemplateProvider<OllamaCompletionPrompt>;
}

export class OllamaCompletionModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>>
  implements
    TextStreamingModel<
      OllamaCompletionPrompt,
      OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(settings: OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>) {
    super({ settings });
  }

  readonly provider = "ollama";
  get modelName() {
    return this.settings.model;
  }

  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  get contextWindowSize(): CONTEXT_WINDOW_SIZE {
    return this.settings.contextWindowSize as CONTEXT_WINDOW_SIZE;
  }

  async callAPI<RESPONSE>(
    prompt: OllamaCompletionPrompt,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: OllamaCompletionResponseFormatType<RESPONSE>;
    }
  ): Promise<RESPONSE> {
    const { responseFormat } = options;
    const api = this.settings.api ?? new OllamaApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/api/generate`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            stream: responseFormat.stream,
            model: this.settings.model,
            prompt: prompt.prompt,
            images: prompt.images,
            format: this.settings.format,
            options: {
              mirostat: this.settings.mirostat,
              mirostat_eta: this.settings.mirostatEta,
              mirostat_tau: this.settings.mirostatTau,
              num_ctx: this.settings.contextWindowSize,
              num_gpu: this.settings.numGpu,
              num_gqa: this.settings.numGqa,
              num_predict: this.settings.maxGenerationTokens,
              num_threads: this.settings.numThreads,
              repeat_last_n: this.settings.repeatLastN,
              repeat_penalty: this.settings.repeatPenalty,
              seed: this.settings.seed,
              stop: this.settings.stopSequences,
              temperature: this.settings.temperature,
              tfs_z: this.settings.tfsZ,
              top_k: this.settings.topK,
              top_p: this.settings.topP,
            },
            system: this.settings.system,
            template: this.settings.template,
            context: this.settings.context,
            raw: this.settings.raw,
          },
          failedResponseHandler: failedOllamaCallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "contextWindowSize",
      "temperature",
      "mirostat",
      "mirostatEta",
      "mirostatTau",
      "numGqa",
      "numGpu",
      "numThreads",
      "repeatLastN",
      "repeatPenalty",
      "seed",
      "tfsZ",
      "topK",
      "topP",
      "system",
      "template",
      "context",
      "format",
      "raw",
    ] satisfies (keyof OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(
    prompt: OllamaCompletionPrompt,
    options: FunctionCallOptions
  ) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options, {
        responseFormat: OllamaCompletionResponseFormat.json,
      })
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        structure: rawResponse,
        schema: zodSchema(ollamaCompletionResponseSchema),
      })
    );
  }

  processTextGenerationResponse(rawResponse: OllamaCompletionResponse) {
    return {
      rawResponse,
      textGenerationResults: [
        {
          text: rawResponse.response,
          finishReason: "unknown" as const,
        },
      ],
    };
  }

  doStreamText(prompt: OllamaCompletionPrompt, options: FunctionCallOptions) {
    return this.callAPI(prompt, options, {
      ...options,
      responseFormat: OllamaCompletionResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    const chunk = delta as OllamaCompletionStreamChunk;
    return chunk.done === true ? undefined : chunk.response;
  }

  asStructureGenerationModel<INPUT_PROMPT, OllamaCompletionPrompt>(
    promptTemplate:
      | StructureFromTextPromptTemplate<INPUT_PROMPT, OllamaCompletionPrompt>
      | FlexibleStructureFromTextPromptTemplate<INPUT_PROMPT, unknown>
  ) {
    return "adaptModel" in promptTemplate
      ? new StructureFromTextStreamingModel({
          model: promptTemplate.adaptModel(this),
          template: promptTemplate,
        })
      : new StructureFromTextStreamingModel({
          model: this as TextStreamingModel<OllamaCompletionPrompt>,
          template: promptTemplate,
        });
  }

  asToolCallGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallPromptTemplate<INPUT_PROMPT, OllamaCompletionPrompt>
  ) {
    return new TextGenerationToolCallModel({
      model: this,
      format: promptTemplate,
    });
  }

  asToolCallsOrTextGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallsPromptTemplate<
      INPUT_PROMPT,
      OllamaCompletionPrompt
    >
  ) {
    return new TextGenerationToolCallsModel({
      model: this,
      template: promptTemplate,
    });
  }

  private get promptTemplateProvider(): TextGenerationPromptTemplateProvider<OllamaCompletionPrompt> {
    return this.settings.promptTemplate ?? Text;
  }

  withJsonOutput(): this {
    return this;
  }

  withTextPrompt(): PromptTemplateTextStreamingModel<
    string,
    OllamaCompletionPrompt,
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.text());
  }

  withInstructionPrompt(): PromptTemplateTextStreamingModel<
    InstructionPrompt,
    OllamaCompletionPrompt,
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.instruction());
  }

  withChatPrompt(): PromptTemplateTextStreamingModel<
    ChatPrompt,
    OllamaCompletionPrompt,
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.chat());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      OllamaCompletionPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    OllamaCompletionPrompt,
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return new PromptTemplateTextStreamingModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      }),
      promptTemplate,
    });
  }

  withSettings(
    additionalSettings: Partial<
      OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
  ) {
    return new OllamaCompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const ollamaCompletionResponseSchema = z.object({
  done: z.literal(true),
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  total_duration: z.number(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number(),
  eval_duration: z.number(),
  context: z.array(z.number()).optional(),
});

export type OllamaCompletionResponse = z.infer<
  typeof ollamaCompletionResponseSchema
>;

const ollamaCompletionStreamChunkSchema = z.discriminatedUnion("done", [
  z.object({
    done: z.literal(false),
    model: z.string(),
    created_at: z.string(),
    response: z.string(),
  }),
  z.object({
    done: z.literal(true),
    model: z.string(),
    created_at: z.string(),
    total_duration: z.number(),
    load_duration: z.number().optional(),
    sample_count: z.number().optional(),
    sample_duration: z.number().optional(),
    prompt_eval_count: z.number(),
    prompt_eval_duration: z.number().optional(),
    eval_count: z.number(),
    eval_duration: z.number(),
    context: z.array(z.number()).optional(),
  }),
]);

export type OllamaCompletionStreamChunk = z.infer<
  typeof ollamaCompletionStreamChunkSchema
>;

export type OllamaCompletionResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OllamaCompletionResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: (async ({ response, url, requestBodyValues }) => {
      const responseBody = await response.text();

      const parsedResult = safeParseJSON({
        text: responseBody,
        schema: zodSchema(
          z.union([
            ollamaCompletionResponseSchema,
            z.object({
              done: z.literal(false),
              model: z.string(),
              created_at: z.string(),
              response: z.string(),
            }),
          ])
        ),
      });

      if (!parsedResult.success) {
        throw new ApiCallError({
          message: "Invalid JSON response",
          cause: parsedResult.error,
          statusCode: response.status,
          responseBody,
          url,
          requestBodyValues,
        });
      }

      if (parsedResult.data.done === false) {
        throw new ApiCallError({
          message: "Incomplete Ollama response received",
          statusCode: response.status,
          responseBody,
          url,
          requestBodyValues,
          isRetryable: true,
        });
      }

      return parsedResult.data;
    }) satisfies ResponseHandler<OllamaCompletionResponse>,
  } satisfies OllamaCompletionResponseFormatType<OllamaCompletionResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: createJsonStreamResponseHandler(
      zodSchema(ollamaCompletionStreamChunkSchema)
    ),
  },
};
