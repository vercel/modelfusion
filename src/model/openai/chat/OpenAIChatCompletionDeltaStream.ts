import { createParser } from "eventsource-parser";
import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { AsyncQueue } from "../../../util/AsyncQueue.js";

const chatCompletionStreamEventSchema = z.object({
  choices: z.array(
    z.object({
      delta: z.object({
        role: z.enum(["assistant", "user"]).optional(),
        content: z.string().optional(),
      }),
      finish_reason: z.enum(["stop"]).nullable(),
      index: z.number(),
    })
  ),
  created: z.number(),
  id: z.string(),
  model: z.string(),
  object: z.string(),
});

export type ChatCompletionChoicesDelta = Array<{
  role: "assistant" | "user" | undefined;
  content: string;
  isComplete: boolean;
  delta: {
    role?: "assistant" | "user";
    content?: string;
  };
}>;

export async function createOpenAIChatCompletionDeltaStream(
  stream: AsyncIterable<Uint8Array>
) {
  const queue = new AsyncQueue<
    | {
        type: "delta";
        delta: ChatCompletionChoicesDelta;
      }
    | {
        type: "error";
        error: unknown;
      }
  >();

  const choices: ChatCompletionChoicesDelta = [];

  const parser = createParser((event) => {
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
      const parseResult = chatCompletionStreamEventSchema.safeParse(json);

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

        if (choices[i] == null) {
          choices[i] = {
            role: undefined,
            content: "",
            isComplete: false,
            delta,
          };
        }

        const choice = choices[i];

        choice.delta = delta;

        if (eventChoice.finish_reason != null) {
          choice.isComplete = true;
        }

        if (delta.content != undefined) {
          choice.content += delta.content;
        }

        if (delta.role != undefined) {
          choice.role = delta.role;
        }
      }

      queue.push({
        type: "delta",
        delta: choices,
      });
    } catch (error) {
      queue.push({ type: "error", error });
      queue.close();
      return;
    }
  });

  // process the stream asynchonously:
  (async () => {
    const decoder = new TextDecoder();
    for await (const value of stream) {
      parser.feed(decoder.decode(value));
    }
  })();

  return queue;
}
