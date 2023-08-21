import {
  CohereTextGenerationModel,
  Llama2ChatPromptFormat,
  LlamaCppTextGenerationModel,
  OpenAIChatChatPromptFormat,
  OpenAIChatModel,
  TextChatPromptFormat,
  createTextDeltaEventSource,
  streamText,
  trimChatPrompt,
} from "modelfusion";
import { z } from "zod";

export const config = { runtime: "edge" };

const messageSchame = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const requestSchema = z.array(messageSchame);

const gpt35turboModel = new OpenAIChatModel({
  model: "gpt-3.5-turbo",
  maxCompletionTokens: 512,
}).withPromptFormat(OpenAIChatChatPromptFormat());

const llama2Model = new LlamaCppTextGenerationModel({
  contextWindowSize: 4096, // Llama 2 context window size
  maxCompletionTokens: 512,
}).withPromptFormat(Llama2ChatPromptFormat());

const otherLlamaCppModel = new LlamaCppTextGenerationModel({
  contextWindowSize: 2048, // set to your models context window size
  maxCompletionTokens: 512,
}).withPromptFormat(TextChatPromptFormat({ user: "user", ai: "assistant" }));

const cohereModel = new CohereTextGenerationModel({
  model: "command",
  maxCompletionTokens: 512,
}).withPromptFormat(TextChatPromptFormat({ user: "user", ai: "assistant" }));

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

  const model = llama2Model; // change this to your preferred model

  const textStream = await streamText(
    model,
    // limit the size of the prompt to leave room for the answer:
    await trimChatPrompt({
      model,
      prompt: [
        {
          system:
            "You are an AI chat bot. " +
            "Follow the user's instructions carefully. Respond using markdown.",
        },
        ...messages.map((message) =>
          message.role === "user"
            ? { user: message.content }
            : { ai: message.content }
        ),
      ],
    }),

    // forward the abort signal:
    { run: { abortSignal: controller.signal } }
  );

  return new Response(createTextDeltaEventSource(textStream), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
};

export default sendMessage;
