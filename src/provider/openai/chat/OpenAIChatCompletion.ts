import zod from "zod";

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

export type OpenAIChatCompletionModel =
  | "gpt-4"
  | "gpt-4-0314"
  | "gpt-4-32k"
  | "gpt-4-32k-0314"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301";
