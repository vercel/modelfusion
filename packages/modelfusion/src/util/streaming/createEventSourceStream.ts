const textEncoder = new TextEncoder();

export function createEventSourceStream(events: AsyncIterable<unknown>) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of events) {
          controller.enqueue(
            textEncoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }
      } finally {
        controller.close();
      }
    },
  });
}
