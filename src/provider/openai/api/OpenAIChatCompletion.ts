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
};

export type OpenAIChatCompletionModel = "gpt-4" | "gpt-3.5-turbo";

export async function generateOpenAIChatCompletion({
  baseUrl = "https://api.openai.com/v1",
  apiKey,
  model,
  messages,
  n,
  temperature,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
}: {
  baseUrl?: string;
  apiKey: string;
  messages: Array<OpenAIChatMessage>;
  model: OpenAIChatCompletionModel;
  n?: number;
  temperature?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}): Promise<OpenAIChatCompletion> {
  return postToOpenAI({
    url: `${baseUrl}/chat/completions`,
    apiKey,
    body: {
      model,
      messages,
      n,
      temperature,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
    },
    responseSchema: openAIChatCompletionSchema,
  });
}
