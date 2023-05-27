import { NextApiResponse } from "next";

export async function forwardStreamToClient({
  response,
  stream,
}: {
  response: NextApiResponse;
  stream: AsyncIterable<Uint8Array>;
}) {
  response.writeHead(200, {
    Connection: "keep-alive",
    "Content-Encoding": "none",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  for await (const chunk of stream) {
    response.write(chunk);
  }

  response.end();
}
