import { Schema } from "../../core/schema/Schema.js";
import { Delta } from "../../model-function/Delta.js";
import { AsyncQueue } from "../AsyncQueue.js";
import { parseJsonStream } from "./parseJsonStream.js";

export async function parseJsonStreamAsAsyncIterable<T>({
  stream,
  schema,
}: {
  stream: ReadableStream<Uint8Array>;
  schema: Schema<T>;
}): Promise<AsyncIterable<Delta<T>>> {
  const queue = new AsyncQueue<Delta<T>>();

  // process the stream asynchonously (no 'await' on purpose):
  parseJsonStream({
    stream,
    schema,
    process(event) {
      queue.push({ type: "delta", deltaValue: event });
    },
    onDone() {
      queue.close();
    },
  });

  return queue;
}
