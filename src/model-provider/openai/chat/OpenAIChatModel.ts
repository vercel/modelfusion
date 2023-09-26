import SecureJSON from "secure-json-parse";
import z from "zod";
import { ApiConfiguration } from "../../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../core/api/postToApi.js";
import { StructureDefinition } from "../../../core/structure/StructureDefinition.js";
import { AbstractModel } from "../../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../../model-function/ModelFunctionOptions.js";
import { StructureGenerationModel } from "../../../model-function/generate-structure/StructureGenerationModel.js";
import { StructureOrTextGenerationModel } from "../../../model-function/generate-structure/StructureOrTextGenerationModel.js";
import { DeltaEvent } from "../../../model-function/generate-text/DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../../model-function/generate-text/TextGenerationModel.js";
import { PromptFormat } from "../../../prompt/PromptFormat.js";
import { PromptFormatTextGenerationModel } from "../../../prompt/PromptFormatTextGenerationModel.js";
import { OpenAIApiConfiguration } from "../OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "../OpenAIError.js";
import { TikTokenTokenizer } from "../TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import {
  OpenAIChatDelta,
  createOpenAIChatFullDeltaIterableQueue,
} from "./OpenAIChatStreamIterable.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";

/*
 * Available OpenAI chat models, their token limits, and pricing.
 *
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_CHAT_MODELS = {
  "gpt-4": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0314": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0613": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-32k": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0314": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0613": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-3.5-turbo": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
    fineTunedPromptTokenCostInMillicents: 1.2,
    fineTunedCompletionTokenCostInMillicents: 1.6,
  },
  "gpt-3.5-turbo-0301": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0613": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
    fineTunedPromptTokenCostInMillicents: 1.2,
    fineTunedCompletionTokenCostInMillicents: 1.6,
  },
  "gpt-3.5-turbo-16k": {
    contextWindowSize: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
  "gpt-3.5-turbo-16k-0613": {
    contextWindowSize: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
};

export function getOpenAIChatModelInformation(model: OpenAIChatModelType): {
  baseModel: OpenAIChatBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number;
  completionTokenCostInMillicents: number;
} {
  // Model is already a base model:
  if (model in OPENAI_CHAT_MODELS) {
    const baseModelInformation =
      OPENAI_CHAT_MODELS[model as OpenAIChatBaseModelType];

    return {
      baseModel: model as OpenAIChatBaseModelType,
      isFineTuned: false,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.promptTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.completionTokenCostInMillicents,
    };
  }

  // Extract the base model from the fine-tuned model:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, baseModel, ___, ____, _____] = model.split(":");

  if (["gpt-3.5-turbo", "gpt-3.5-turbo-0613"].includes(baseModel)) {
    const baseModelInformation =
      OPENAI_CHAT_MODELS[baseModel as FineTuneableOpenAIChatModelType];

    return {
      baseModel: baseModel as FineTuneableOpenAIChatModelType,
      isFineTuned: true,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.fineTunedPromptTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.fineTunedCompletionTokenCostInMillicents,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
}

type FineTuneableOpenAIChatModelType = `gpt-3.5-turbo` | `gpt-3.5-turbo-0613`;

type FineTunedOpenAIChatModelType =
  `ft:${FineTuneableOpenAIChatModelType}:${string}:${string}:${string}`;

export type OpenAIChatBaseModelType = keyof typeof OPENAI_CHAT_MODELS;

export type OpenAIChatModelType =
  | OpenAIChatBaseModelType
  | FineTunedOpenAIChatModelType;

export const isOpenAIChatModel = (
  model: string
): model is OpenAIChatModelType =>
  model in OPENAI_CHAT_MODELS ||
  model.startsWith("ft:gpt-3.5-turbo-0613:") ||
  model.startsWith("ft:gpt-3.5-turbo:");

export const calculateOpenAIChatCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAIChatModelType;
  response: OpenAIChatResponse;
}): number => {
  const modelInformation = getOpenAIChatModelInformation(model);

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};

export interface OpenAIChatCallSettings {
  api?: ApiConfiguration;

  model: OpenAIChatModelType;

  functions?: Array<{
    name: string;
    description?: string;
    parameters: unknown;
  }>;
  functionCall?: "none" | "auto" | { name: string };

  stop?: string | string[];
  maxTokens?: number;

  temperature?: number;
  topP?: number;
  n?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  logitBias?: Record<number, number>;
}

export interface OpenAIChatSettings
  extends TextGenerationModelSettings,
    Omit<OpenAIChatCallSettings, "stop" | "maxTokens"> {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls the OpenAI chat completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const model = new OpenAIChatModel({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
 * });
 *
 * const text = await generateText([
 *   model,
 *   OpenAIChatMessage.system(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export class OpenAIChatModel
  extends AbstractModel<OpenAIChatSettings>
  implements
    TextGenerationModel<
      OpenAIChatMessage[],
      OpenAIChatResponse,
      OpenAIChatDelta,
      OpenAIChatSettings
    >,
    StructureGenerationModel<
      OpenAIChatMessage[],
      OpenAIChatResponse,
      OpenAIChatSettings
    >,
    StructureOrTextGenerationModel<
      OpenAIChatMessage[],
      OpenAIChatResponse,
      OpenAIChatSettings
    >
{
  constructor(settings: OpenAIChatSettings) {
    super({ settings });

    const modelInformation = getOpenAIChatModelInformation(this.settings.model);

    this.tokenizer = new TikTokenTokenizer({
      model: modelInformation.baseModel,
    });
    this.contextWindowSize = modelInformation.contextWindowSize;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: TikTokenTokenizer;

  /**
   * Counts the prompt tokens required for the messages. This includes the message base tokens
   * and the prompt base tokens.
   */
  countPromptTokens(messages: OpenAIChatMessage[]) {
    return countOpenAIChatPromptTokens({
      messages,
      model: this.modelName,
    });
  }

  async callAPI<RESULT>(
    messages: Array<OpenAIChatMessage>,
    options: {
      responseFormat: OpenAIChatResponseFormatType<RESULT>;
    } & ModelFunctionOptions<
      Partial<OpenAIChatCallSettings & { user?: string }>
    >
  ): Promise<RESULT> {
    const { run, settings, responseFormat } = options;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,

      // Copied settings:
      ...combinedSettings,

      // map to OpenAI API names:
      stop: combinedSettings.stopSequences,
      maxTokens: combinedSettings.maxCompletionTokens,

      // other settings:
      abortSignal: run?.abortSignal,
      messages,
      responseFormat,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callOpenAIChatCompletionAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<OpenAIChatSettings> {
    const eventSettingProperties: Array<string> = [
      "stopSequences",
      "maxCompletionTokens",

      "functions",
      "functionCall",
      "temperature",
      "topP",
      "n",
      "presencePenalty",
      "frequencyPenalty",
      "logitBias",
    ] satisfies (keyof OpenAIChatSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  generateTextResponse(
    prompt: OpenAIChatMessage[],
    options?: ModelFunctionOptions<OpenAIChatSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.json,
    });
  }

  extractText(response: OpenAIChatResponse): string {
    return response.choices[0]!.message.content!;
  }

  generateDeltaStreamResponse(
    prompt: OpenAIChatMessage[],
    options?: ModelFunctionOptions<OpenAIChatSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: OpenAIChatDelta): string | undefined {
    return fullDelta[0]?.delta.content ?? undefined;
  }

  /**
   * JSON generation uses the OpenAI GPT function calling API.
   * It provides a single function specification and instructs the model to provide parameters for calling the function.
   * The result is returned as parsed JSON.
   *
   * @see https://platform.openai.com/docs/guides/gpt/function-calling
   */
  generateStructureResponse(
    structureDefinition: StructureDefinition<string, unknown>,
    prompt: OpenAIChatMessage[],
    options?: ModelFunctionOptions<OpenAIChatSettings> | undefined
  ): PromiseLike<OpenAIChatResponse> {
    return this.callAPI(prompt, {
      responseFormat: OpenAIChatResponseFormat.json,
      functionId: options?.functionId,
      settings: {
        ...options,

        functionCall: { name: structureDefinition.name },
        functions: [
          {
            name: structureDefinition.name,
            description: structureDefinition.description,
            parameters: structureDefinition.schema.getJsonSchema(),
          },
        ],
      },
      run: options?.run,
    });
  }

  extractStructure(response: OpenAIChatResponse): unknown {
    const jsonText = response.choices[0]!.message.function_call!.arguments;
    return SecureJSON.parse(jsonText);
  }

  generateStructureStreamResponse(
    structureDefinition: StructureDefinition<string, unknown>,
    prompt: OpenAIChatMessage[],
    options?: ModelFunctionOptions<OpenAIChatSettings> | undefined
  ) {
    return this.callAPI(prompt, {
      responseFormat: OpenAIChatResponseFormat.deltaIterable,
      functionId: options?.functionId,
      settings: {
        ...options,

        functionCall: { name: structureDefinition.name },
        functions: [
          {
            name: structureDefinition.name,
            description: structureDefinition.description,
            parameters: structureDefinition.schema.getJsonSchema(),
          },
        ],
      },
      run: options?.run,
    });
  }

  extractPartialStructure(fullDelta: OpenAIChatDelta) {
    return fullDelta[0]?.function_call?.arguments;
  }

  generateStructureOrTextResponse(
    structureDefinitions: Array<StructureDefinition<string, unknown>>,
    prompt: OpenAIChatMessage[],
    options?: ModelFunctionOptions<OpenAIChatSettings> | undefined
  ): PromiseLike<OpenAIChatResponse> {
    return this.callAPI(prompt, {
      responseFormat: OpenAIChatResponseFormat.json,
      functionId: options?.functionId,
      settings: {
        ...options,

        functionCall: "auto",
        functions: structureDefinitions.map((structureDefinition) => ({
          name: structureDefinition.name,
          description: structureDefinition.description,
          parameters: structureDefinition.schema.getJsonSchema(),
        })),
      },
      run: options?.run,
    });
  }

  extractStructureAndText(response: OpenAIChatResponse) {
    const message = response.choices[0]!.message;
    const content = message.content;
    const functionCall = message.function_call;

    return functionCall == null
      ? {
          structure: null,
          value: null,
          text: content ?? "",
        }
      : {
          structure: functionCall.name,
          value: SecureJSON.parse(functionCall.arguments),
          text: content,
        };
  }

  extractUsage(response: OpenAIChatResponse) {
    return {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, OpenAIChatMessage[]>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    OpenAIChatMessage[],
    OpenAIChatResponse,
    OpenAIChatDelta,
    OpenAIChatSettings,
    this
  > {
    return new PromptFormatTextGenerationModel({
      model: this.withSettings({ stopSequences: promptFormat.stopSequences }),
      promptFormat,
    });
  }

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const openAIChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal("assistant"),
        content: z.string().nullable(),
        function_call: z
          .object({
            name: z.string(),
            arguments: z.string(),
          })
          .optional(),
      }),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAIChatResponse = z.infer<typeof openAIChatResponseSchema>;

async function callOpenAIChatCompletionAPI<RESPONSE>({
  api = new OpenAIApiConfiguration(),
  abortSignal,
  responseFormat,
  model,
  messages,
  functions,
  functionCall,
  temperature,
  topP,
  n,
  stop,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
  logitBias,
  user,
}: OpenAIChatCallSettings & {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: OpenAIChatResponseFormatType<RESPONSE>;
  messages: Array<OpenAIChatMessage>;
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: api.assembleUrl("/chat/completions"),
    headers: api.headers,
    body: {
      stream: responseFormat.stream,
      model,
      messages,
      functions,
      function_call: functionCall,
      temperature,
      top_p: topP,
      n,
      stop,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      logit_bias: logitBias,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type OpenAIChatResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OpenAIChatResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(openAIChatResponseSchema),
  } satisfies OpenAIChatResponseFormatType<OpenAIChatResponse>,

  /**
   * Returns an async iterable over the text deltas (only the tex different of the first choice).
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatFullDeltaIterableQueue(response.body!),
  } satisfies OpenAIChatResponseFormatType<
    AsyncIterable<DeltaEvent<OpenAIChatDelta>>
  >,
};
