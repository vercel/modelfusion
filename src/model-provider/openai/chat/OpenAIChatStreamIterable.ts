import { createParser } from "eventsource-parser";
import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { AsyncQueue } from "../../../util/AsyncQueue.js";

const chatResponseStreamEventSchema = z.object({
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

export type OpenAIChatFullDelta = Array<{
  role: "assistant" | "user" | undefined;
  content: string;
  isComplete: boolean;
  delta: {
    role?: "assistant" | "user";
    content?: string;
  };
}>;

type OpenAIChatFullDeltaEvent =
  | {
      type: "delta";
      fullDelta: OpenAIChatFullDelta;
    }
  | {
      type: "error";
      error: unknown;
    }
  | undefined;

async function createOpenAIChatFullDeltaIterableQueue(
  stream: AsyncIterable<Uint8Array>
): Promise<AsyncIterable<OpenAIChatFullDeltaEvent>> {
  const queue = new AsyncQueue<OpenAIChatFullDeltaEvent>();

  const streamDelta: OpenAIChatFullDelta = [];

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

async function* extractTextDelta(
  fullDeltaIterable: AsyncIterable<OpenAIChatFullDeltaEvent>
): AsyncIterable<string> {
  for await (const event of fullDeltaIterable) {
    if (event?.type === "error") {
      throw event.error;
    }

    if (event?.type === "delta") {
      const delta = event.fullDelta[0]?.delta.content;

      if (delta != null && delta.length > 0) {
        yield delta;
      }
    }
  }
}

export async function createOpenAIChatTextDeltaIterable(
  stream: AsyncIterable<Uint8Array>
): Promise<AsyncIterable<string>> {
  return extractTextDelta(await createOpenAIChatFullDeltaIterableQueue(stream));
}

async function* extractFullDelta(
  fullDeltaIterable: AsyncIterable<OpenAIChatFullDeltaEvent>
): AsyncIterable<OpenAIChatFullDelta> {
  for await (const event of fullDeltaIterable) {
    if (event?.type === "error") {
      throw event.error;
    }

    if (event?.type === "delta") {
      yield event.fullDelta;
    }
  }
}

export async function createOpenAIChatFullDeltaIterable(
  stream: AsyncIterable<Uint8Array>
): Promise<AsyncIterable<OpenAIChatFullDelta>> {
  return extractFullDelta(await createOpenAIChatFullDeltaIterableQueue(stream));
}
