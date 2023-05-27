import { createStreamResponseHandler, postToOpenAI } from "../postToOpenAI.js";
import { OpenAIChatMessage } from "./OpenAIChatCompletion.js";
import { OpenAIChatModelType } from "./OpenAIChatModel.js";

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
  maxGeneratedTokens,
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
  maxGeneratedTokens?: number;
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
      max_tokens: maxGeneratedTokens,
      temperature,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      user,
    },
    successfulResponseHandler: createStreamResponseHandler(),
    abortSignal,
  });
}
