import { Schema } from "../../core/schema/Schema";
import { Delta } from "../../model-function/Delta";
import { AsyncQueue } from "../AsyncQueue";
import { parseJsonStream } from "./parseJsonStream";

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
