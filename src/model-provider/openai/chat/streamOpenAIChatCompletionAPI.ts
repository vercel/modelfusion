import { convertReadableStreamToAsyncIterable } from "../../../util/convertReadableStreamToAsyncIterable.js";
import {
  ResponseHandler,
  createAsyncIterableResponseHandler,
  createStreamResponseHandler,
  postJsonToApi,
} from "../../../util/api/postToApi.js";
import { failedOpenAICallResponseHandler } from "../failedOpenAICallResponseHandler.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatModelType } from "./OpenAIChatModel.js";
import {
  OpenAIChatResponseDeltaStreamEntry,
  createOpenAIChatResponseDeltaStream,
} from "./OpenAIChatResponseDeltaStream.js";

export type OpenAIStreamChatCompletionResponseFormat<T> = {
  handler: ResponseHandler<T>;
};

/**
 * Call the OpenAI chat completion API to stream a chat completion for the messages.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const stream = await streamOpenAIChatCompletionAPI({
 *   apiKey: OPENAI_API_KEY,
 *   model: "gpt-3.5-turbo",
 *   messages: [
 *     {
 *       role: "system",
 *       content:
 *         "You are an AI assistant. Follow the user's instructions carefully.",
 *     },
 *     {
 *       role: "user",
 *       content: "Hello, how are you?",
 *     },
 *   ],
 *   temperature: 0.7,
 *   maxTokens: 500,
 *   responseFormat: streamOpenAIChatCompletionAPI.responseFormat.readStream,
 * });
 */
export async function streamOpenAIChatCompletionAPI<T>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  responseFormat,
  apiKey,
  model,
  messages,
  temperature,
  topP,
  n,
  stop,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  responseFormat: OpenAIStreamChatCompletionResponseFormat<T>;
  apiKey: string;
  model: OpenAIChatModelType;
  messages: Array<OpenAIChatMessage>;
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  user?: string;
}): Promise<T> {
  return postJsonToApi({
    url: `${baseUrl}/chat/completions`,
    apiKey,
    body: {
      stream: true,
      model,
      messages,
      top_p: topP,
      n,
      stop,
      max_tokens: maxTokens,
      temperature,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

streamOpenAIChatCompletionAPI.responseFormat = {
  readStream: {
    handler: createStreamResponseHandler(),
  },
  asyncUint8ArrayIterable: {
    handler: createAsyncIterableResponseHandler(),
  },
  asyncDeltaIterable: {
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatResponseDeltaStream(
        convertReadableStreamToAsyncIterable(response.body!.getReader())
      ),
  } satisfies OpenAIStreamChatCompletionResponseFormat<
    AsyncIterable<OpenAIChatResponseDeltaStreamEntry>
  >,
};
