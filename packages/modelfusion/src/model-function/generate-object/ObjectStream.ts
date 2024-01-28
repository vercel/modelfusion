import type { PartialDeep } from "type-fest";
import { Schema } from "../../core/schema/Schema";
import { parsePartialJson } from "../../util/parsePartialJson";

export type ObjectStream<OBJECT> = AsyncIterable<{
  partialObject: PartialDeep<OBJECT, { recurseIntoArrays: true }>;
  partialText: string;
  textDelta: string;
}>;

/**
 * Response for ObjectStream. The object stream is encoded as a text stream.
 *
 * Example:
 * ```ts
 * return new ObjectStreamResponse(objectStream);
 * ```
 */
export class ObjectStreamResponse extends Response {
  constructor(stream: ObjectStream<unknown>, init?: ResponseInit) {
    super(ObjectStreamToTextStream(stream), {
      ...init,
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Convert a Response to a lightweight ObjectStream. The response must be created
 * using ObjectStreamResponse on the server.
 *
 * @see ObjectStreamResponse
 */
export async function* ObjectStreamFromResponse<OBJECT>({
  response,
}: {
  schema: Schema<OBJECT>;
  response: Response;
}) {
  let text = "";

  const reader = response.body!.getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    text += new TextDecoder().decode(value);

    const partialObject = parsePartialJson(text) as OBJECT;

    yield { partialObject };
  }
}

function ObjectStreamToTextStream(stream: ObjectStream<unknown>) {
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
