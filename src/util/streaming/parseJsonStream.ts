import { parseJsonWithZod } from "../parseJSON.js";

export function parseJsonStream<T>({
  schema,
  stream,
  process,
  onDone,
}: {
  schema: Zod.Schema<T>;
  stream: ReadableStream<Uint8Array>;
  process: (event: T) => void;
  onDone?: () => void;
}) {
  function processLine(line: string) {
    process(parseJsonWithZod(line, schema));
  }

  return (async () => {
    try {
      let unprocessedText = "";
      const reader = new ReadableStreamDefaultReader(stream);
      const utf8Decoder = new TextDecoder("utf-8");

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value: chunk, done } = await reader.read();

        if (done) {
          break;
        }

        unprocessedText += utf8Decoder.decode(chunk, { stream: true });

        const processableLines = unprocessedText.split(/\r\n|\n|\r/g);

        unprocessedText = processableLines.pop() || "";

        processableLines.forEach(processLine);
      }

      // processing remaining text:
      if (unprocessedText) {
        processLine(unprocessedText);
      }
    } finally {
      onDone?.();
    }
  })();
}
