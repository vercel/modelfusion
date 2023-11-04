import { ParsedEvent } from "eventsource-parser";
import { convertReadableStreamToAsyncIterable } from "./convertReadableStreamToAsyncIterable.js";
import { EventSourceParserStream } from "./EventSourceParserStream.js";

export async function parseEventSourceStream({
  stream,
}: {
  stream: ReadableStream<Uint8Array>;
}): Promise<AsyncIterable<ParsedEvent>> {
  const eventStream = stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream());

  return convertReadableStreamToAsyncIterable(eventStream);
}
