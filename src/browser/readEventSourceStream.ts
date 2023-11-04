import { Schema } from "../core/structure/Schema.js";
import { ErrorHandler } from "../util/ErrorHandler.js";
import { safeParseJsonWithSchema } from "../util/parseJSON.js";
import { AsyncQueue } from "../util/AsyncQueue.js";
import { parseEventSourceStream } from "../util/streaming/parseEventSourceStream.js";

export function readEventSourceStream<T>({
  stream,
  schema,
  errorHandler,
}: {
  stream: ReadableStream<Uint8Array>;
  schema: Schema<T>;
  errorHandler?: ErrorHandler;
}): AsyncIterable<T> {
  const queue = new AsyncQueue<T>();

  // run async (no await on purpose):
  parseEventSourceStream({ stream })
    .then(async (events) => {
      try {
        for await (const event of events) {
          const validationResult = safeParseJsonWithSchema(event.data, schema);

          if (!validationResult.success) {
            errorHandler?.(validationResult.error);
            continue;
          }

          queue.push(validationResult.data);
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
