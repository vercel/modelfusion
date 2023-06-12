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

const model = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
  maxTokens: 1000,
});

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

  const messagesToSend: OpenAIChatMessage[] =
    await composeRecentMessagesOpenAIChatPrompt({
      model: model.modelName,
      systemMessage: OpenAIChatMessage.system(
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown."
      ),
      messages: parsedData.data,
      maxTokens: model.settings.maxTokens ?? 100,
    });

  // forward the abort signal
  const controller = new AbortController();
  request.signal.addEventListener("abort", () => {
    // TODO current not working because of a Next.js bug:
    // https://github.com/vercel/next.js/issues/50364
    return controller.abort();
  });

  const stream = await model.callAPI(
    messagesToSend,
    { responseFormat: OpenAIChatResponseFormat.readStream },
    { abortSignal: controller.signal }
  );

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
