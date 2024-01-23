import { AsyncQueue, Schema, safeParseJSON } from "modelfusion";
import { ErrorHandler, parseEventSourceStream } from "modelfusion/internal";

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
          const validationResult = safeParseJSON({ text: event.data, schema });

          if (!validationResult.success) {
            errorHandler?.(validationResult.error);
            continue;
          }

          queue.push(validationResult.value);
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
