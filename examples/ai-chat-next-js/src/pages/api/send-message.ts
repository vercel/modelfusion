import {
  CohereTextGenerationModel,
  LlamaCppTextGenerationModel,
  OpenAIChatMessage,
  OpenAIChatModel,
  composeRecentMessagesOpenAIChatPrompt,
  createTextDeltaEventSourceReadableStream,
  streamText,
} from "ai-utils.js";
import { z } from "zod";

export const config = { runtime: "edge" };

const messageSchame = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

type Message = z.infer<typeof messageSchame>;

const requestSchema = z.array(messageSchame);

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

  // forward the abort signal
  const controller = new AbortController();
  request.signal.addEventListener("abort", () => controller.abort());

  const messages = parsedData.data;

  const stream = await createTextStream(messages, controller);
  // const stream = await createOpenAIChatStream(messages, controller);

  return new Response(createTextDeltaEventSourceReadableStream(stream), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
};

export default sendMessage;

async function createTextStream(
  messages: Message[],
  controller: AbortController
) {
  return streamText(
    new LlamaCppTextGenerationModel({}),
    // You can also use other models such as CohereTextGenerationModel instead:
    // new CohereTextGenerationModel({
    //   model: "command-nightly",
    //   maxTokens: 1000,
    // }),
    [
      "You are an AI chat bot. " +
        "Follow the user's instructions carefully. Respond using markdown.",
      ...messages.map((message) => {
        return `${message.role}: ${message.content}\n\n`;
      }),
      "\n\nassistant: ",
    ].join("\n"),
    { run: { abortSignal: controller.signal } }
  );
}

async function createOpenAIChatStream(
  messages: Message[],
  controller: AbortController
) {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    maxTokens: 1000,
  });

  return streamText(
    model,
    await composeRecentMessagesOpenAIChatPrompt({
      model: model.modelName,
      systemMessage: OpenAIChatMessage.system(
        "You are an AI chat bot. " +
          "Follow the user's instructions carefully. Respond using markdown."
      ),
      messages,
      maxTokens: model.settings.maxTokens ?? 100,
    }),
    { run: { abortSignal: controller.signal } }
  );
}
