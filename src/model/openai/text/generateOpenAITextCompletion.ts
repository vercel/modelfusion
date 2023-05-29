import {
  createJsonResponseHandler,
  postJsonToOpenAI,
} from "../postToOpenAI.js";
import {
  OpenAITextCompletion,
  openAITextCompletionSchema,
} from "./OpenAITextCompletion.js";
import { OpenAITextModelType } from "./OpenAITextModel.js";

export async function generateOpenAITextCompletion({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  model,
  prompt,
  suffix,
  maxCompletionTokens,
  temperature,
  topP,
  n,
  logprobs,
  echo,
  stop,
  presencePenalty,
  frequencyPenalty,
  bestOf,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: OpenAITextModelType;
  prompt: string;
  suffix?: string;
  maxCompletionTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
  user?: string;
}): Promise<OpenAITextCompletion> {
  return postJsonToOpenAI({
    url: `${baseUrl}/completions`,
    apiKey,
    body: {
      model,
      prompt,
      suffix,
      max_tokens: maxCompletionTokens,
      temperature,
      top_p: topP,
      n,
      logprobs,
      echo,
      stop,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      best_of: bestOf,
      user,
    },
    successfulResponseHandler: createJsonResponseHandler(
      openAITextCompletionSchema
    ),
    abortSignal,
  });
}
