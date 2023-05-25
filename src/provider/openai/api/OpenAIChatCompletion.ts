import zod from "zod";
import { postToOpenAI } from "./postToOpenAI.js";

export const openAIChatCompletionSchema = zod.object({
  id: zod.string(),
  object: zod.literal("chat.completion"),
  created: zod.number(),
  model: zod.string(),
  choices: zod.array(
    zod.object({
      message: zod.object({
        role: zod.literal("assistant"),
        content: zod.string(),
      }),
      index: zod.number(),
      logprobs: zod.nullable(zod.any()),
      finish_reason: zod.string(),
    })
  ),
  usage: zod.object({
    prompt_tokens: zod.number(),
    completion_tokens: zod.number(),
    total_tokens: zod.number(),
  }),
});

export type OpenAIChatCompletion = zod.infer<typeof openAIChatCompletionSchema>;

export type OpenAIChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
};

export type OpenAIChatCompletionModel = "gpt-4" | "gpt-3.5-turbo";

export async function generateOpenAIChatCompletion({
  baseUrl = "https://api.openai.com/v1",
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
  apiKey: string;
  model: OpenAIChatCompletionModel;
  messages: Array<OpenAIChatMessage>;
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  user?: string;
}): Promise<OpenAIChatCompletion> {
  return postToOpenAI({
    url: `${baseUrl}/chat/completions`,
    apiKey,
    body: {
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
    responseSchema: openAIChatCompletionSchema,
  });
}
