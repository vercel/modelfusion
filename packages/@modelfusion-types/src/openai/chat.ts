import { z } from "zod";
import {
  OPENAI_CHAT_MODEL_COSTS,
  OPENAI_CHAT_CONTEXT_WINDOW_SIZES,
} from "./constants";

type FineTuneableOpenAIChatModelType =
  | `gpt-3.5-turbo`
  | `gpt-3.5-turbo-0613`
  | `gpt-4-0613`;

type FineTunedOpenAIChatModelType =
  `ft:${FineTuneableOpenAIChatModelType}:${string}:${string}:${string}`;

export type OpenAIChatBaseModelType = keyof typeof OPENAI_CHAT_MODEL_COSTS;

export type OpenAIChatModelType =
  | OpenAIChatBaseModelType
  | FineTunedOpenAIChatModelType;

export const isOpenAIChatModel = (
  model: string
): model is OpenAIChatModelType =>
  model in OPENAI_CHAT_MODEL_COSTS ||
  model.startsWith("ft:gpt-3.5-turbo-0613:") ||
  model.startsWith("ft:gpt-3.5-turbo:");

export const openAIChatResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal("assistant"),
        content: z.string().nullable(),
        function_call: z
          .object({
            name: z.string(),
            arguments: z.string(),
          })
          .optional(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            })
          )
          .optional(),
      }),
      index: z.number().optional(), // optional for OpenAI compatible models
      logprobs: z.nullable(z.any()),
      finish_reason: z
        .enum([
          "stop",
          "length",
          "tool_calls",
          "content_filter",
          "function_call",
        ])
        .optional()
        .nullable(),
    })
  ),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().optional().nullable(),
  object: z.literal("chat.completion"),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAIChatResponse = z.infer<typeof openAIChatResponseSchema>;

export const openaiChatChunkSchema = z.object({
  object: z.string(), // generalized for openai compatible providers, z.literal("chat.completion.chunk")
  id: z.string(),
  choices: z.array(
    z.object({
      delta: z.object({
        role: z.enum(["assistant", "user"]).optional(),
        content: z.string().nullable().optional(),
        function_call: z
          .object({
            name: z.string().optional(),
            arguments: z.string().optional(),
          })
          .optional(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            })
          )
          .optional(),
      }),
      finish_reason: z
        .enum([
          "stop",
          "length",
          "tool_calls",
          "content_filter",
          "function_call",
        ])
        .nullable()
        .optional(),
      index: z.number(),
    })
  ),
  created: z.number(),
  model: z.string().optional(), // optional for OpenAI compatible models
  system_fingerprint: z.string().optional().nullable(),
});

export type OpenAIChatChunk = z.infer<typeof openaiChatChunkSchema>;

export function getOpenAIChatModelInformation(model: OpenAIChatModelType): {
  baseModel: OpenAIChatBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number | null;
  completionTokenCostInMillicents: number | null;
} {
  // Model is already a base model:
  if (model in OPENAI_CHAT_MODEL_COSTS) {
    const { promptTokenCostInMillicents, completionTokenCostInMillicents } =
      OPENAI_CHAT_MODEL_COSTS[model as OpenAIChatBaseModelType];
    const contextWindowSize =
      OPENAI_CHAT_CONTEXT_WINDOW_SIZES[model as OpenAIChatBaseModelType];

    return {
      baseModel: model as OpenAIChatBaseModelType,
      isFineTuned: false,
      contextWindowSize,
      promptTokenCostInMillicents,
      completionTokenCostInMillicents,
    };
  }

  // Extract the base model from the fine-tuned model:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, baseModel, ___, ____, _____] = model.split(":");

  if (
    ["gpt-3.5-turbo", "gpt-3.5-turbo-0613", "gpt-4-0613"].includes(baseModel)
  ) {
    const fineTunedBaseModel = baseModel as FineTuneableOpenAIChatModelType;
    const {
      fineTunedPromptTokenCostInMillicents,
      fineTunedCompletionTokenCostInMillicents,
    } = OPENAI_CHAT_MODEL_COSTS[fineTunedBaseModel];
    const contextWindowSize =
      OPENAI_CHAT_CONTEXT_WINDOW_SIZES[fineTunedBaseModel];

    return {
      baseModel: fineTunedBaseModel,
      isFineTuned: true,
      contextWindowSize,
      promptTokenCostInMillicents: fineTunedPromptTokenCostInMillicents,
      completionTokenCostInMillicents: fineTunedCompletionTokenCostInMillicents,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
}
