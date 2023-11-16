import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { FunctionOptions } from "../../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../core/api/postToApi.js";
import { StructureDefinition } from "../../../core/schema/StructureDefinition.js";
import { parseJSON } from "../../../core/schema/parseJSON.js";
import { AbstractModel } from "../../../model-function/AbstractModel.js";
import { Delta } from "../../../model-function/Delta.js";
import { StructureGenerationModel } from "../../../model-function/generate-structure/StructureGenerationModel.js";
import { StructureOrTextGenerationModel } from "../../../model-function/generate-structure/StructureOrTextGenerationModel.js";
import { StructureParseError } from "../../../model-function/generate-structure/StructureParseError.js";
import { parsePartialJson } from "../../../model-function/generate-structure/parsePartialJson.js";
import { PromptFormatTextStreamingModel } from "../../../model-function/generate-text/PromptFormatTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptFormat } from "../../../model-function/generate-text/TextGenerationPromptFormat.js";
import { ToolCallDefinition } from "../../../model-function/generate-tool-call/ToolCallDefinition.js";
import { ToolCallGenerationModel } from "../../../model-function/generate-tool-call/ToolCallGenerationModel.js";
import { OpenAIApiConfiguration } from "../OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "../OpenAIError.js";
import { TikTokenTokenizer } from "../TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { chat, instruction } from "./OpenAIChatPromptFormat.js";
import { createOpenAIChatDeltaIterableQueue } from "./OpenAIChatStreamIterable.js";
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
    fineTunedPromptTokenCostInMillicents: null,
    fineTunedCompletionTokenCostInMillicents: null,
  },
  "gpt-4-1106-preview": {
    contextWindowSize: 128000,
    promptTokenCostInMillicents: 1,
    completionTokenCostInMillicents: 3,
  },
  "gpt-4-vision-preview": {
    contextWindowSize: 128000,
    promptTokenCostInMillicents: 1,
    completionTokenCostInMillicents: 3,
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
    fineTunedPromptTokenCostInMillicents: 0.3,
    fineTunedCompletionTokenCostInMillicents: 0.6,
  },
  "gpt-3.5-turbo-1106": {
    contextWindowSize: 16385,
    promptTokenCostInMillicents: 0.1,
    completionTokenCostInMillicents: 0.2,
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
  promptTokenCostInMillicents: number | null;
  completionTokenCostInMillicents: number | null;
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

  if (
    ["gpt-3.5-turbo", "gpt-3.5-turbo-0613", "gpt-4-0613"].includes(baseModel)
  ) {
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

type FineTuneableOpenAIChatModelType =
  | `gpt-3.5-turbo`
  | `gpt-3.5-turbo-0613`
  | `gpt-4-0613`;

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
}): number | null => {
  const { promptTokenCostInMillicents, completionTokenCostInMillicents } =
    getOpenAIChatModelInformation(model);

  // null: when cost is unknown, e.g. for fine-tuned models where the price is not yet known
  if (
    promptTokenCostInMillicents == null ||
    completionTokenCostInMillicents == null
  ) {
    return null;
  }

  return (
    response.usage.prompt_tokens * promptTokenCostInMillicents +
    response.usage.completion_tokens * completionTokenCostInMillicents
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

  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description?: string;
      parameters: unknown;
    };
  }>;
  toolChoice?:
    | "none"
    | "auto"
    | { type: "function"; function: { name: string } };

  stop?: string | string[];
  maxTokens?: number;

  temperature?: number;
  topP?: number;

  seed?: number | null;

  responseFormat?: {
    type?: "text" | "json_object";
  };

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
    TextStreamingModel<OpenAIChatMessage[], OpenAIChatSettings>,
    StructureGenerationModel<OpenAIChatMessage[], OpenAIChatSettings>,
    StructureOrTextGenerationModel<OpenAIChatMessage[], OpenAIChatSettings>,
    ToolCallGenerationModel<OpenAIChatMessage[], OpenAIChatSettings>
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
    } & FunctionOptions & {
        functions?: OpenAIChatCallSettings["functions"];
        functionCall?: OpenAIChatCallSettings["functionCall"];
        tools?: OpenAIChatCallSettings["tools"];
        toolChoice?: OpenAIChatCallSettings["toolChoice"];
      }
  ): Promise<RESULT> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callOpenAIChatCompletionAPI({
          ...this.settings,

          // function & tool calling:
          functions: options.functions ?? this.settings.functions,
          functionCall: options.functionCall ?? this.settings.functionCall,
          tools: options.tools ?? this.settings.tools,
          toolChoice: options.toolChoice ?? this.settings.toolChoice,

          // map to OpenAI API names:
          stop: this.settings.stopSequences,
          maxTokens: this.settings.maxCompletionTokens,
          openAIResponseFormat: this.settings.responseFormat,

          // other settings:
          user: this.settings.isUserIdForwardingEnabled
            ? options.run?.userId
            : undefined,
          abortSignal: options.run?.abortSignal,

          responseFormat: options.responseFormat,
          messages,
        }),
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
      "seed",
      "responseFormat",
    ] satisfies (keyof OpenAIChatSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateText(prompt: OpenAIChatMessage[], options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.json,
    });

    return {
      response,
      text: response.choices[0]!.message.content!,
      usage: this.extractUsage(response),
    };
  }

  doStreamText(prompt: OpenAIChatMessage[], options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.textDeltaIterable,
    });
  }

  /**
   * JSON generation uses the OpenAI GPT function calling API.
   * It provides a single function specification and instructs the model to provide parameters for calling the function.
   * The result is returned as parsed JSON.
   *
   * @see https://platform.openai.com/docs/guides/gpt/function-calling
   */
  async doGenerateStructure(
    structureDefinition: StructureDefinition<string, unknown>,
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.json,
      functionCall: { name: structureDefinition.name },
      functions: [
        {
          name: structureDefinition.name,
          description: structureDefinition.description,
          parameters: structureDefinition.schema.getJsonSchema(),
        },
      ],
    });

    const valueText = response.choices[0]!.message.function_call!.arguments;

    try {
      return {
        response,
        valueText,
        value: SecureJSON.parse(valueText),
        usage: this.extractUsage(response),
      };
    } catch (error) {
      throw new StructureParseError({
        structureName: structureDefinition.name,
        valueText,
        cause: error,
      });
    }
  }

  async doStreamStructure(
    structureDefinition: StructureDefinition<string, unknown>,
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.structureDeltaIterable,
      functionCall: { name: structureDefinition.name },
      functions: [
        {
          name: structureDefinition.name,
          description: structureDefinition.description,
          parameters: structureDefinition.schema.getJsonSchema(),
        },
      ],
    });
  }

  async doGenerateStructureOrText(
    structureDefinitions: Array<StructureDefinition<string, unknown>>,
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.json,
      functionCall: "auto",
      functions: structureDefinitions.map((structureDefinition) => ({
        name: structureDefinition.name,
        description: structureDefinition.description,
        parameters: structureDefinition.schema.getJsonSchema(),
      })),
    });

    const message = response.choices[0]!.message;
    const content = message.content;
    const functionCall = message.function_call;

    if (functionCall == null) {
      return {
        response,
        structureAndText: {
          structure: null,
          value: null,
          valueText: null,
          text: content ?? "",
        },
        usage: this.extractUsage(response),
      };
    }

    try {
      return {
        response,
        structureAndText: {
          structure: functionCall.name,
          value: SecureJSON.parse(functionCall.arguments),
          valueText: functionCall.arguments,
          text: content,
        },
        usage: this.extractUsage(response),
      };
    } catch (error) {
      throw new StructureParseError({
        structureName: functionCall.name,
        valueText: functionCall.arguments,
        cause: error,
      });
    }
  }

  async doGenerateToolCall(
    tool: ToolCallDefinition<string, unknown>,
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.json,
      toolChoice: {
        type: "function",
        function: { name: tool.name },
      },
      tools: [
        {
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters.getJsonSchema(),
          },
        },
      ],
    });

    const toolCalls = response.choices[0]?.message.tool_calls;

    return {
      response,
      value:
        toolCalls == null || toolCalls.length === 0
          ? null
          : {
              id: toolCalls[0].id,
              parameters: parseJSON({ text: toolCalls[0].function.arguments }),
            },
      usage: this.extractUsage(response),
    };
  }

  extractUsage(response: OpenAIChatResponse) {
    return {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }

  /**
   * Returns this model with an instruction prompt format.
   */
  withInstructionPrompt() {
    return this.withPromptFormat(instruction());
  }

  /**
   * Returns this model with a chat prompt format.
   */
  withChatPrompt() {
    return this.withPromptFormat(chat());
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, OpenAIChatMessage[]>
  ): PromptFormatTextStreamingModel<
    INPUT_PROMPT,
    OpenAIChatMessage[],
    OpenAIChatSettings,
    this
  > {
    return new PromptFormatTextStreamingModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptFormat.stopSequences,
        ],
      }),
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
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            })
          )
          .optional(),
      }),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      finish_reason: z
        .enum([
          "stop",
          "length",
          "tool_calls",
          "content_filter",
          "function_call",
        ])
        .optional()
        .nullable(),
    })
  ),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().optional(),
  object: z.literal("chat.completion"),
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
  tools,
  toolChoice,
  temperature,
  topP,
  n,
  stop,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
  logitBias,
  user,
  openAIResponseFormat,
  seed,
}: OpenAIChatCallSettings & {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: OpenAIChatResponseFormatType<RESPONSE>;
  messages: Array<OpenAIChatMessage>;
  user?: string;
  openAIResponseFormat: OpenAIChatCallSettings["responseFormat"]; // mapping
}): Promise<RESPONSE> {
  // empty arrays are not allowed for stop:
  if (stop != null && Array.isArray(stop) && stop.length === 0) {
    stop = undefined;
  }

  return postJsonToApi({
    url: api.assembleUrl("/chat/completions"),
    headers: api.headers,
    body: {
      stream: responseFormat.stream,
      model,
      messages,
      functions,
      function_call: functionCall,
      tools,
      tool_choice: toolChoice,
      temperature,
      top_p: topP,
      n,
      stop,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      logit_bias: logitBias,
      seed,
      response_format: openAIResponseFormat,
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
  textDeltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatDeltaIterableQueue(
        response.body!,
        (delta) => delta[0]?.delta.content ?? ""
      ),
  } satisfies OpenAIChatResponseFormatType<AsyncIterable<Delta<string>>>,

  structureDeltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatDeltaIterableQueue(response.body!, (delta) =>
        parsePartialJson(delta[0]?.function_call?.arguments)
      ),
  } satisfies OpenAIChatResponseFormatType<AsyncIterable<Delta<unknown>>>,
};
