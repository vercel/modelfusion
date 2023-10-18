import { z } from "zod";
import { AsyncQueue } from "../../../event-source/AsyncQueue.js";
import { parseEventSourceStream } from "../../../event-source/parseEventSourceStream.js";
import { Delta } from "../../../model-function/Delta.js";
import { safeParseJsonWithZod } from "../../../util/parseJSON.js";

const chatResponseStreamEventSchema = z.object({
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
      }),
      finish_reason: z.enum(["stop", "length"]).nullable(),
      index: z.number(),
    })
  ),
  created: z.number(),
  id: z.string(),
  model: z.string(),
  object: z.string(),
});

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

          const parseResult = safeParseJsonWithZod(
            data,
            chatResponseStreamEventSchema
          );

          if (!parseResult.success) {
            queue.push({
              type: "error",
              error: parseResult.error,
            });
            queue.close();
            return;
          }

          const eventData = parseResult.data;

          for (let i = 0; i < eventData.choices.length; i++) {
            const eventChoice = eventData.choices[i];
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
