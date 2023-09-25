import SecureJSON from "secure-json-parse";
import { ErrorHandler } from "../util/ErrorHandler.js";
import { AsyncQueue } from "./AsyncQueue.js";
import { parseEventSourceStream } from "./parseEventSourceStream.js";

export function readEventSourceStream<T>({
  stream,
  schema,
  errorHandler,
}: {
  stream: ReadableStream<Uint8Array>;
  schema: Zod.Schema<T>;
  errorHandler?: ErrorHandler;
}): AsyncIterable<T> {
  const queue = new AsyncQueue<T>();

  // run async (no await on purpose):
  parseEventSourceStream({ stream })
    .then(async (events) => {
      try {
        for await (const event of events) {
          queue.push(schema.parse(SecureJSON.parse(event.data)));
        }
      } catch (error) {
        errorHandler?.(error);
      } finally {
        queue.close();
      }
    })
    .catch((error) => {
      errorHandler?.(error);
      queue.close();
    });

  return queue;
}
