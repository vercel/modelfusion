import type { PartialDeep } from "type-fest";
import { parsePartialJson } from "../../util/parsePartialJson.js";

export type StructureStream<STRUCTURE> = AsyncIterable<{
  partialStructure: PartialDeep<STRUCTURE, { recurseIntoArrays: true }>;
  partialText: string;
  textDelta: string;
}>;

export async function* parseStructureStreamResponse<T>({
  response,
}: {
  response: Response;
}) {
  let text = "";

  const reader = response.body!.getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    text += new TextDecoder().decode(value);

    yield parsePartialJson(text) as T; // TODO partial parsing?
  }
}

export function createStructureStream(stream: StructureStream<unknown>) {
  const textEncoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const { textDelta } of stream) {
          controller.enqueue(textEncoder.encode(textDelta));
        }
      } finally {
        controller.close();
      }
    },
  });
}
