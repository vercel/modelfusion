import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import { NextApiHandler } from "next";
import { z } from "zod";

const requestSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
);

const openAiApiKey = process.env.OPENAI_API_KEY;

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

  const url = `https://api.openai.com/v1/chat/completions`;

  const fetchResponse = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [...messages],
      max_tokens: 1000,
      temperature: 0.4,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (fetchResponse.status !== 200) {
    const result = await fetchResponse.json();

    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || result.statusText
      }`
    );
  }

  function write(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (response.write(data)) {
        process.nextTick(resolve);
      } else {
        response.once("drain", resolve);
      }
    });
  }

  let fullMessage = "";

  const parser = createParser(
    async (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;

        try {
          const json = JSON.parse(data);
          if (json.choices[0].finish_reason != null) {
            response.end();
            return;
          }
          const text = json.choices[0].delta.content;

          if (text != undefined) {
            fullMessage += text;

            await write(
              encoder.encode(
                JSON.stringify({
                  type: "chunk",
                  text,
                }) + "\n"
              )
            );
          }
        } catch (e) {
          response.end();
        }
      }
    }
  );

  response.writeHead(200, {
    Connection: "keep-alive",
    "Content-Encoding": "none",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  for await (const chunk of fetchResponse.body as any) {
    parser.feed(decoder.decode(chunk));
  }
};

export default sendMessage;
