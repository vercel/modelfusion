import { forwardStreamToClient } from "@/util/forwardStreamToClient";
import {
  OpenAIChatMessage,
  OpenAIChatModelType,
  composeRecentMessagesOpenAIChatPrompt,
  streamOpenAIChatCompletion,
} from "@lgrammel/ai-utils/provider/openai";
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

  const model = "gpt-3.5-turbo" as OpenAIChatModelType;
  const maxCompletionTokens = 1000;

  const messagesToSend: OpenAIChatMessage[] =
    await composeRecentMessagesOpenAIChatPrompt({
      model,
      systemMessage: {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      },
      messages: parsedData.data,
      maxCompletionTokens,
    });

  const stream = await streamOpenAIChatCompletion({
    apiKey: openAiApiKey,
    model,
    messages: messagesToSend,
    maxCompletionTokens,
  });

  forwardStreamToClient({ stream, response });
};

export default sendMessage;
