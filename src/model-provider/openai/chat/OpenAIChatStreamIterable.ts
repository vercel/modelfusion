import { z } from "zod";
import { AsyncQueue } from "../../../util/AsyncQueue.js";
import { parseEventSourceStream } from "../../../util/streaming/parseEventSourceStream.js";
import { Delta } from "../../../model-function/Delta.js";
import { safeParseJSON } from "../../../core/schema/parseJSON.js";
import { ZodSchema } from "../../../core/schema/ZodSchema.js";

const chatCompletionChunkSchema = z.object({
  object: z.literal("chat.completion.chunk"),
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
  model: z.string(),
  system_fingerprint: z.string().optional().nullable(),
});

type ChatCompletionChunk = z.infer<typeof chatCompletionChunkSchema>;

const chatResponseStreamEventSchema = new ZodSchema(
  z.union([
    chatCompletionChunkSchema,
    z.object({
      object: z.string().refine((obj) => obj !== "chat.completion.chunk", {
        message: "Object must not be 'chat.completion.chunk'",
      }),
    }),
  ])
);

export type OpenAIChatDelta = Array<{
  role: "assistant" | "user" | undefined;
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  isComplete: boolean;
  delta: {
    role?: "assistant" | "user";
    content?: string | null;
    function_call?: {
      name?: string;
      arguments?: string;
    };
  };
}>;

export async function createOpenAIChatDeltaIterableQueue<VALUE>(
  stream: ReadableStream<Uint8Array>,
  extractDeltaValue: (delta: OpenAIChatDelta) => VALUE
): Promise<AsyncIterable<Delta<VALUE>>> {
  const queue = new AsyncQueue<Delta<VALUE>>();
  const streamDelta: OpenAIChatDelta = [];

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceStream({ stream })
    .then(async (events) => {
      try {
        for await (const event of events) {
          const data = event.data;

          if (data === "[DONE]") {
            queue.close();
            return;
          }

          const parseResult = safeParseJSON({
            text: data,
            schema: chatResponseStreamEventSchema,
          });

          if (!parseResult.success) {
            queue.push({
              type: "error",
              error: parseResult.error,
            });
            // Note: the queue is not closed on purpose. Some providers might add additional
            // chunks that are not parsable, and ModelFusion should be resilient to that.
            continue;
          }

          const eventData = parseResult.data;

          // ignore objects that are not "chat.completion.chunk" events.
          // Such additional objects are e.g. sent by Azure OpenAI.
          if (eventData.object !== "chat.completion.chunk") {
            continue;
          }

          const completionChunk = eventData as ChatCompletionChunk;

          for (let i = 0; i < completionChunk.choices.length; i++) {
            const eventChoice = completionChunk.choices[i];
            const delta = eventChoice.delta;

            if (streamDelta[i] == null) {
              streamDelta[i] = {
                role: undefined,
                content: "",
                isComplete: false,
                delta,
              };
            }

            const choice = streamDelta[i];

            choice.delta = delta;

            if (eventChoice.finish_reason != null) {
              choice.isComplete = true;
            }

            if (delta.content != undefined) {
              choice.content += delta.content;
            }

            if (delta.function_call != undefined) {
              if (choice.function_call == undefined) {
                choice.function_call = {
                  name: "",
                  arguments: "",
                };
              }

              if (delta.function_call.name != undefined) {
                choice.function_call!.name += delta.function_call.name;
              }

              if (delta.function_call.arguments != undefined) {
                choice.function_call!.arguments +=
                  delta.function_call.arguments;
              }
            }

            if (delta.role != undefined) {
              choice.role = delta.role;
            }
          }

          // Since we're mutating the choices array in an async scenario,
          // we need to make a deep copy:
          const streamDeltaDeepCopy: OpenAIChatDelta = JSON.parse(
            JSON.stringify(streamDelta)
          );

          queue.push({
            type: "delta",
            fullDelta: streamDeltaDeepCopy,
            valueDelta: extractDeltaValue(streamDeltaDeepCopy),
          });
        }
      } catch (error) {
        queue.push({ type: "error", error });
        queue.close();
        return;
      }
    })
    .catch((error) => {
      queue.push({ type: "error", error });
      queue.close();
      return;
    });

  return queue;
}
