import { EventSourceParseCallback, createParser } from "eventsource-parser";

async function* convertReadableStreamToAsyncIterable<T>(
  reader: ReadableStreamDefaultReader<T>
): AsyncIterable<T> {
  while (true) {
    const result = await reader.read();

    if (result.done) {
      break;
    }

    yield result.value;
  }
}

/**
 * @internal
 */
export async function parseEventSourceReadableStream({
  stream,
  callback,
}: {
  stream: ReadableStream<Uint8Array>;
  callback: EventSourceParseCallback;
}) {
  try {
    const parser = createParser(callback);
    const decoder = new TextDecoder();
    const iterable = convertReadableStreamToAsyncIterable(stream.getReader());
    for await (const value of iterable) {
      parser.feed(decoder.decode(value));
    }
  } catch (error) {
    console.error(error); // TODO introduce error handler param
  }
}
