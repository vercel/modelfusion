import { parsePartialJson } from "../parsePartialJson.js";

export async function parseJsonStreamResponse<T>({
  response,
  onChunk,
}: {
  response: Response;
  onChunk: (chunk: T) => void;
}) {
  let text = "";

  const reader = response.body!.getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    text += new TextDecoder().decode(value);

    onChunk(parsePartialJson(text) as T); // TODO partial parsing?
  }
}
