import { streamOpenAIChatCompletionX } from "@/component/streamOpenAIChatCompletion";
import { NextApiHandler } from "next";
import { z } from "zod";

const requestSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
);

const openAiApiKey = process.env.OPENAI_API_KEY ?? "";

const sendMessage: NextApiHandler = async (request, response) => {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: `Method ${request.method} not allowed. Only POST allowed.`,
    });
  }

  const parsedData = requestSchema.safeParse(request.body);

  if (parsedData.success === false) {
    return response
      .status(400)
      .json({ error: `Could not parse content. Error: ${parsedData.error}` });
  }

  const messages = parsedData.data;
  const encoder = new TextEncoder();

  await streamOpenAIChatCompletionX({
    apiKey: openAiApiKey,
    model: "gpt-3.5-turbo",
    messages,
    onCompletionStreamEvent: (event) => {
      if (event.type === "start") {
        response.writeHead(200, {
          Connection: "keep-alive",
          "Content-Encoding": "none",
          "Cache-Control": "no-cache",
          "Content-Type": "text/event-stream",
        });
      } else if (event.type === "chunk") {
        response.write(
          encoder.encode(
            JSON.stringify({
              type: "chunk",
              text: event.text,
            }) + "\n"
          )
        );
      } else if (event.type === "end") {
        response.end();
      }
    },
  });
};

export default sendMessage;
