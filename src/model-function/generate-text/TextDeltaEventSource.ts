import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { ErrorHandler } from "../../util/ErrorHandler.js";
import { AsyncQueue } from "../../event-source/AsyncQueue.js";
import { parseEventSourceReadableStream } from "../../event-source/parseEventSourceReadableStream.js";

const textEncoder = new TextEncoder();

const textDeltaEventDataSchema = z.object({
  textDelta: z.string().optional(),
  isFinished: z.boolean(),
});

type TextDeltaEventData = z.infer<typeof textDeltaEventDataSchema>;

function enqueueData(
  controller: ReadableStreamDefaultController<unknown>,
  data: TextDeltaEventData
) {
  controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export function createTextDeltaEventSource(textDeltas: AsyncIterable<string>) {
  return new ReadableStream({
    async start(controller) {
      for await (const textDelta of textDeltas) {
        enqueueData(controller, { textDelta, isFinished: false });
      }

      enqueueData(controller, { isFinished: true });
    },
  });
}

export function parseTextDeltaEventSource(
  stream: ReadableStream<Uint8Array>,
  options?: {
    errorHandler: ErrorHandler;
  }
): AsyncIterable<string | undefined> {
  const queue = new AsyncQueue<string | undefined>();

  // run async (no await on purpose):
  parseEventSourceReadableStream({
    stream,
    callback: (event) => {
      if (event.type !== "event") {
        return;
      }

      try {
        const data = textDeltaEventDataSchema.parse(
          SecureJSON.parse(event.data)
        );

        queue.push(data.textDelta);

        if (data.isFinished) {
          queue.close();
        }
      } catch (error) {
        options?.errorHandler(error);
        queue.close();
      }
    },
  });

  return queue;
}
