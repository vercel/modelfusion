import { safeParseJSON } from "../../core/schema/parseJSON.js";
import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../../model-function/Delta.js";
import { AsyncQueue } from "../AsyncQueue.js";
import { parseEventSourceStream } from "./parseEventSourceStream.js";

export async function parseEventSourceStreamAsAsyncIterable<T>({
  stream,
  schema,
}: {
  stream: ReadableStream<Uint8Array>;
  schema: Schema<T>;
}): Promise<AsyncIterable<Delta<T>>> {
  const queue = new AsyncQueue<Delta<T>>();

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
            schema,
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

          const completionChunk = parseResult.data;

          queue.push({
            type: "delta",
            deltaValue: completionChunk,
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
