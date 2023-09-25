export async function* convertReadableStreamToAsyncIterable<T>(
  stream: ReadableStream<T>
): AsyncIterable<T> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return; // This will close the generator
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
