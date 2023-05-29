import {
  ResponseHandler,
  createAsyncIterableResponseHandler,
  createStreamResponseHandler,
  postJsonToOpenAI,
} from "../postToOpenAI.js";
import { OpenAIChatMessage } from "./OpenAIChatCompletion.js";
import { OpenAIChatModelType } from "./OpenAIChatModel.js";

export type OpenAIStreamChatCompletionResponseFormat<T> = {
  handler: ResponseHandler<T>;
};

export const streamOpenAIChatCompletionResponseFormat = Object.freeze({
  readStream: Object.freeze({
    handler: createStreamResponseHandler(),
  }),
  asyncIterable: Object.freeze({
    handler: createAsyncIterableResponseHandler(),
  }),
});

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
  return postJsonToOpenAI({
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
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}
