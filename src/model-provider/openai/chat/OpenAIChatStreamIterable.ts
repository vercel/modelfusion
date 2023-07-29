import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { AsyncQueue } from "../../../model-function/generate-text/AsyncQueue.js";
import { DeltaEvent } from "../../../model-function/generate-text/DeltaEvent.js";
import { parseEventSourceReadableStream } from "../../../model-function/generate-text/parseEventSourceReadableStream.js";

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

export async function createOpenAIChatFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<DeltaEvent<OpenAIChatDelta>>> {
  const queue = new AsyncQueue<DeltaEvent<OpenAIChatDelta>>();
  const streamDelta: OpenAIChatDelta = [];

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceReadableStream({
    stream,
    callback: (event) => {
      if (event.type !== "event") {
        return;
      }

      const data = event.data;

      if (data === "[DONE]") {
        queue.close();
        return;
      }

      try {
        const json = SecureJSON.parse(data);
        const parseResult = chatResponseStreamEventSchema.safeParse(json);

        if (!parseResult.success) {
          queue.push({
            type: "error",
            error: parseResult.error,
          });
          queue.close();
          return;
        }

        const event = parseResult.data;

        for (let i = 0; i < event.choices.length; i++) {
          const eventChoice = event.choices[i];
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
              choice.function_call!.arguments += delta.function_call.arguments;
            }
          }

          if (delta.role != undefined) {
            choice.role = delta.role;
          }
        }

        // Since we're mutating the choices array in an async scenario,
        // we need to make a deep copy:
        const streamDeltaDeepCopy = JSON.parse(JSON.stringify(streamDelta));

        queue.push({
          type: "delta",
          fullDelta: streamDeltaDeepCopy,
        });
      } catch (error) {
        queue.push({ type: "error", error });
        queue.close();
        return;
      }
    },
  });

  return queue;
}
