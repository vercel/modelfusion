import { z } from "zod";

/**
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "gpt-3.5-turbo-instruct": {
    contextWindowSize: 4097,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
};

export type OpenAICompletionModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export const isOpenAICompletionModel = (
  model: string
): model is OpenAICompletionModelType => model in OPENAI_TEXT_GENERATION_MODELS;

export const OpenAICompletionResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      finish_reason: z
        .enum(["stop", "length", "content_filter"])
        .optional()
        .nullable(),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      text: z.string(),
    })
  ),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().optional(),
  object: z.literal("text_completion"),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAICompletionResponse = z.infer<
  typeof OpenAICompletionResponseSchema
>;

export const openaiCompletionStreamChunkSchema = z.object({
  choices: z.array(
    z.object({
      text: z.string(),
      finish_reason: z
        .enum(["stop", "length", "content_filter"])
        .optional()
        .nullable(),
      index: z.number(),
    })
  ),
  created: z.number(),
  id: z.string(),
  model: z.string(),
  system_fingerprint: z.string().optional(),
  object: z.literal("text_completion"),
});

export type OpenAICompletionStreamChunk = z.infer<
  typeof openaiCompletionStreamChunkSchema
>;

export function getOpenAICompletionModelInformation(
  model: OpenAICompletionModelType
): {
  contextWindowSize: number;
  promptTokenCostInMillicents: number;
  completionTokenCostInMillicents: number;
} {
  return OPENAI_TEXT_GENERATION_MODELS[model];
}
