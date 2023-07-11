import {
  OpenAIChatMessage,
  OpenAIChatResponseFormat,
  composeRecentMessagesOpenAIChatPrompt,
  OpenAIChatModel,
} from "ai-utils.js";
import { z } from "zod";

export const config = { runtime: "edge" };

const requestSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
);

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

  const stream = await createOpenAIChatStream(parsedData.data, request);

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

async function createOpenAIChatStream(
  data: { role: "user" | "assistant"; content: string }[],
  request: Request
) {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    maxTokens: 1000,
  });

  const messagesToSend: OpenAIChatMessage[] =
    await composeRecentMessagesOpenAIChatPrompt({
      model: model.modelName,
      systemMessage: OpenAIChatMessage.system(
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown."
      ),
      messages: data,
      maxTokens: model.settings.maxTokens ?? 100,
    });

  // forward the abort signal
  const controller = new AbortController();
  request.signal.addEventListener("abort", () => controller.abort());

  return await model.callAPI(messagesToSend, {
    responseFormat: OpenAIChatResponseFormat.readableStream,
    run: { abortSignal: controller.signal },
  });
}
