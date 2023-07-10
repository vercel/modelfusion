export type DeltaEvent =
  | {
      type: "delta";
    }
  | {
      type: "error";
      error: unknown;
    }
  | undefined;

export async function* extractTextDelta<EVENT extends DeltaEvent>(
  deltaIterable: AsyncIterable<EVENT>,
  extractDelta: (event: EVENT & { type: "delta" }) => string | undefined
): AsyncIterable<string> {
  for await (const event of deltaIterable) {
    if (event?.type === "error") {
      throw event.error;
    }

    if (event?.type === "delta") {
      const delta = extractDelta(event as EVENT & { type: "delta" });

      if (delta != null && delta.length > 0) {
        yield delta;
      }
    }
  }
}
