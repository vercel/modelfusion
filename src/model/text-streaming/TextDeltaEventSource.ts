import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { ErrorHandler } from "../../util/ErrorHandler.js";
import { AsyncQueue } from "./AsyncQueue.js";
import { parseEventSourceReadableStream } from "./parseEventSourceReadableStream.js";

const textEncoder = new TextEncoder();

const textDeltaEventDataSchema = z.object({
  textDelta: z.string().optional(),
  isFinished: z.boolean(),
});

type TextDeltaEventData = z.infer<typeof textDeltaEventDataSchema>;

function enqueueData(
  controller: ReadableStreamDefaultController<any>,
  data: TextDeltaEventData
) {
  controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export function createTextDeltaEventSourceReadableStream(
  textDeltas: AsyncIterable<string>
) {
  return new ReadableStream({
    async start(controller) {
      for await (const textDelta of textDeltas) {
        enqueueData(controller, { textDelta, isFinished: false });
      }

      enqueueData(controller, { isFinished: true });
    },
  });
}

export function convertTextDeltaEventSourceToIterable(
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
      } catch (error) {
        options?.errorHandler(error);
      }
    },
  });

  return queue;
}
