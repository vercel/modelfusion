import { streamOpenAIChatCompletion } from "@lgrammel/ai-utils/provider/openai";
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

  const stream = await streamOpenAIChatCompletion({
    apiKey: openAiApiKey,
    model: "gpt-3.5-turbo",
    messages,
  });

  // forward stream to client:

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
};

export default sendMessage;
