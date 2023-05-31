import { convertReadableStreamToAsyncIterable } from "../../../internal/convertReadableStreamToAsyncIterable.js";
import {
  ResponseHandler,
  createAsyncIterableResponseHandler,
  createStreamResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedOpenAICallResponseHandler } from "../OpenAIError.js";
import { OpenAIChatMessage } from "./OpenAIChatCompletion.js";
import {
  OpenAIChatCompletionDeltaStreamEntry,
  createOpenAIChatCompletionDeltaStream,
} from "./OpenAIChatCompletionDeltaStream.js";
import { OpenAIChatModelType } from "./OpenAIChatModel.js";

export type OpenAIStreamChatCompletionResponseFormat<T> = {
  handler: ResponseHandler<T>;
};

export const streamOpenAIChatCompletionResponseFormat = Object.freeze({
  readStream: Object.freeze({
    handler: createStreamResponseHandler(),
  }),
  asyncUint8ArrayIterable: Object.freeze({
    handler: createAsyncIterableResponseHandler(),
  }),
  asyncDeltaIterable: Object.freeze({
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatCompletionDeltaStream(
        convertReadableStreamToAsyncIterable(response.body!.getReader())
      ),
  } satisfies OpenAIStreamChatCompletionResponseFormat<AsyncIterable<OpenAIChatCompletionDeltaStreamEntry>>),
});

/**
 * Call the OpenAI chat completion API to stream a chat completion for the messages.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const stream = await streamOpenAIChatCompletion({
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
 *   maxCompletionTokens: 500,
 *   responseFormat: streamOpenAIChatCompletionResponseFormat.readStream,
 * });
 */
export async function streamOpenAIChatCompletion<T>({
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
  maxCompletionTokens,
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
  maxCompletionTokens?: number;
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
      max_tokens: maxCompletionTokens,
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
