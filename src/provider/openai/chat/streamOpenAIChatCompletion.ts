import { createStreamResponseHandler, postToOpenAI } from "../postToOpenAI.js";
import {
  OpenAIChatModelType,
  OpenAIChatMessage,
} from "./OpenAIChatCompletion.js";

export async function streamOpenAIChatCompletion({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
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
}): Promise<AsyncIterable<Uint8Array>> {
  return postToOpenAI({
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
    successfulResponseHandler: createStreamResponseHandler(),
    abortSignal,
  });
}
