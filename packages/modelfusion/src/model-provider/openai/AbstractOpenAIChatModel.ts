import {
  openAIChatResponseSchema,
  openaiChatChunkSchema,
  OpenAIChatResponse,
  OpenAIChatChunk,
} from "@modelfusion/types";

import { FunctionCallOptions } from "../../core/FunctionOptions";
import { ApiConfiguration } from "../../core/api/ApiConfiguration";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi";
import { zodSchema } from "../../core/schema/ZodSchema";
import { parseJSON } from "../../core/schema/parseJSON";
import { validateTypes } from "../../core/schema/validateTypes";
import { AbstractModel } from "../../model-function/AbstractModel";
import { TextGenerationModelSettings } from "../../model-function/generate-text/TextGenerationModel";
import { TextGenerationFinishReason } from "../../model-function/generate-text/TextGenerationResult";
import { ToolDefinition } from "../../tool/ToolDefinition";
import { createEventSourceResponseHandler } from "../../util/streaming/createEventSourceResponseHandler";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration";
import { OpenAIChatMessage } from "./OpenAIChatMessage";
import { failedOpenAICallResponseHandler } from "./OpenAIError";

export interface AbstractOpenAIChatSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;

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

  /**
   * `temperature`: Controls the randomness and creativity in the model's responses.
   * A lower temperature (close to 0) results in more predictable, conservative text, while a higher temperature (close to 1) produces more varied and creative output.
   * Adjust this to balance between consistency and creativity in the model's replies.
   * Example: temperature: 0.5
   */
  temperature?: number;

  /**
   *  This parameter sets a threshold for token selection based on probability.
   * The model will only consider the most likely tokens that cumulatively exceed this threshold while generating a response.
   * It's a way to control the randomness of the output, balancing between diverse responses and sticking to more likely words.
   * This means a topP of .1 will be far less random than one at .9
   * Example: topP: 0.2
   */
  topP?: number;

  /**
   * Used to set the initial state for the random number generator in the model.
   * Providing a specific seed value ensures consistent outputs for the same inputs across different runs - useful for testing and reproducibility.
   * A `null` value (or not setting it) results in varied, non-repeatable outputs each time.
   * Example: seed: 89 (or) seed: null
   */
  seed?: number | null;

  /**
   * Discourages the model from repeating the same information or context already mentioned in the conversation or prompt.
   * Increasing this value encourages the model to introduce new topics or ideas, rather than reiterating what has been said.
   * This is useful for maintaining a diverse and engaging conversation or for brainstorming sessions where varied ideas are needed.
   * Example: presencePenalty: 1.0 // Strongly discourages repeating the same content.
   */
  presencePenalty?: number;

  /**
   * This parameter reduces the likelihood of the model repeatedly using the same words or phrases in its responses.
   * A higher frequency penalty promotes a wider variety of language and expressions in the output.
   * This is particularly useful in creative writing or content generation tasks where diversity in language is desirable.
   * Example: frequencyPenalty: 0.5 // Moderately discourages repetitive language.
   */
  frequencyPenalty?: number;

  responseFormat?: {
    type?: "text" | "json_object";
  };

  logitBias?: Record<number, number>;

  isUserIdForwardingEnabled?: boolean;
}

export type OpenAIChatPrompt = OpenAIChatMessage[];

/**
 * Abstract text generation model that calls an API that is compatible with the OpenAI chat API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 */
export abstract class AbstractOpenAIChatModel<
  SETTINGS extends AbstractOpenAIChatSettings,
> extends AbstractModel<SETTINGS> {
  constructor(settings: SETTINGS) {
    super({ settings });
  }

  async callAPI<RESULT>(
    messages: OpenAIChatPrompt,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: OpenAIChatResponseFormatType<RESULT>;
      functions?: AbstractOpenAIChatSettings["functions"];
      functionCall?: AbstractOpenAIChatSettings["functionCall"];
      tools?: AbstractOpenAIChatSettings["tools"];
      toolChoice?: AbstractOpenAIChatSettings["toolChoice"];
    }
  ): Promise<RESULT> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const responseFormat = options.responseFormat;
    const abortSignal = callOptions.run?.abortSignal;
    const user = this.settings.isUserIdForwardingEnabled
      ? callOptions.run?.userId
      : undefined;
    const openAIResponseFormat = this.settings.responseFormat;

    // function & tool calling:
    const functions = options.functions ?? this.settings.functions;
    const functionCall = options.functionCall ?? this.settings.functionCall;
    const tools = options.tools ?? this.settings.tools;
    const toolChoice = options.toolChoice ?? this.settings.toolChoice;

    let { stopSequences } = this.settings;

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () => {
        // empty arrays are not allowed for stopSequences:
        if (
          stopSequences != null &&
          Array.isArray(stopSequences) &&
          stopSequences.length === 0
        ) {
          stopSequences = undefined;
        }

        return postJsonToApi({
          url: api.assembleUrl("/chat/completions"),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            stream: responseFormat.stream,
            model: this.settings.model,
            messages,
            functions,
            function_call: functionCall,
            tools,
            tool_choice: toolChoice,
            temperature: this.settings.temperature,
            top_p: this.settings.topP,
            n: this.settings.numberOfGenerations,
            stop: stopSequences,
            max_tokens: this.settings.maxGenerationTokens,
            presence_penalty: this.settings.presencePenalty,
            frequency_penalty: this.settings.frequencyPenalty,
            logit_bias: this.settings.logitBias,
            seed: this.settings.seed,
            response_format: openAIResponseFormat,
            user,
          },
          failedResponseHandler: failedOpenAICallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        });
      },
    });
  }

  async doGenerateTexts(
    prompt: OpenAIChatPrompt,
    options: FunctionCallOptions
  ) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options, {
        responseFormat: OpenAIChatResponseFormat.json,
      })
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        value: rawResponse,
        schema: zodSchema(openAIChatResponseSchema),
      })
    );
  }

  processTextGenerationResponse(rawResponse: OpenAIChatResponse) {
    return {
      rawResponse,
      textGenerationResults: rawResponse.choices.map((choice) => ({
        text: choice.message.content ?? "",
        finishReason: this.translateFinishReason(choice.finish_reason),
      })),
      usage: this.extractUsage(rawResponse),
    };
  }

  private translateFinishReason(
    finishReason: string | null | undefined
  ): TextGenerationFinishReason {
    switch (finishReason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "content_filter":
        return "content-filter";
      case "function_call":
      case "tool_calls":
        return "tool-calls";
      default:
        return "unknown";
    }
  }

  doStreamText(prompt: OpenAIChatPrompt, options: FunctionCallOptions) {
    return this.callAPI(prompt, options, {
      responseFormat: OpenAIChatResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    const chunk = delta as OpenAIChatChunk;

    if (
      chunk.object !== "chat.completion.chunk" &&
      chunk.object !== "chat.completion" // for OpenAI-compatible models
    ) {
      return undefined;
    }

    const chatChunk = chunk as OpenAIChatChunk;

    const firstChoice = chatChunk.choices[0];

    if (firstChoice.index > 0) {
      return undefined;
    }

    return firstChoice.delta.content ?? undefined;
  }

  async doGenerateToolCall(
    tool: ToolDefinition<string, unknown>,
    prompt: OpenAIChatPrompt,
    options: FunctionCallOptions
  ) {
    const rawResponse = await this.callAPI(prompt, options, {
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

    const toolCalls = rawResponse.choices[0]?.message.tool_calls;

    return {
      rawResponse,
      toolCall:
        toolCalls == null || toolCalls.length === 0
          ? null
          : {
              id: toolCalls[0].id,
              args: parseJSON({ text: toolCalls[0].function.arguments }),
            },
      usage: this.extractUsage(rawResponse),
    };
  }

  async doGenerateToolCalls(
    tools: Array<ToolDefinition<string, unknown>>,
    prompt: OpenAIChatPrompt,
    options: FunctionCallOptions
  ) {
    const rawResponse = await this.callAPI(prompt, options, {
      responseFormat: OpenAIChatResponseFormat.json,
      toolChoice: "auto",
      tools: tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters.getJsonSchema(),
        },
      })),
    });

    const message = rawResponse.choices[0]?.message;

    return {
      rawResponse,
      text: message.content ?? null,
      toolCalls:
        message.tool_calls?.map((toolCall) => ({
          id: toolCall.id,
          name: toolCall.function.name,
          args: parseJSON({ text: toolCall.function.arguments }),
        })) ?? null,
      usage: this.extractUsage(rawResponse),
    };
  }

  extractUsage(response: OpenAIChatResponse) {
    return {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }
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
    handler: createJsonResponseHandler(zodSchema(openAIChatResponseSchema)),
  },

  /**
   * Returns an async iterable over the text deltas (only the tex different of the first choice).
   */
  deltaIterable: {
    stream: true,
    handler: createEventSourceResponseHandler(zodSchema(openaiChatChunkSchema)),
  },
};
