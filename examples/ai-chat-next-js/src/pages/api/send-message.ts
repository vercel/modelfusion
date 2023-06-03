import {
  OpenAIChatMessage,
  OpenAIChatModelType,
  composeRecentMessagesOpenAIChatPrompt,
  streamOpenAIChatCompletion,
} from "ai-utils.js/model/openai";
import { z } from "zod";

export const config = { runtime: "edge" };

const requestSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
);

const openAiApiKey = process.env.OPENAI_API_KEY ?? "";

const sendMessage = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: `Method ${request.method} not allowed. Only POST allowed.`,
      }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsedData = requestSchema.safeParse(await request.json());

  if (parsedData.success === false) {
    return new Response(
      JSON.stringify({
        error: `Could not parse content. Error: ${parsedData.error}`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const model = "gpt-3.5-turbo" as OpenAIChatModelType;
  const maxTokens = 1000;

  const messagesToSend: OpenAIChatMessage[] =
    await composeRecentMessagesOpenAIChatPrompt({
      model,
      systemMessage: {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      },
      messages: parsedData.data,
      maxTokens,
    });

  // forward the abort signal
  const controller = new AbortController();
  request.signal.addEventListener("abort", () => {
    // TODO current not working because of a Next.js bug:
    // https://github.com/vercel/next.js/issues/50364
    return controller.abort();
  });

  const stream = await streamOpenAIChatCompletion({
    apiKey: openAiApiKey,
    model,
    messages: messagesToSend,
    maxTokens,
    responseFormat: streamOpenAIChatCompletion.responseFormat.readStream,
    abortSignal: controller.signal,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
};

export default sendMessage;
