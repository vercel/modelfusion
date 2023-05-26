import {
  OpenAIChatCompletionModel,
  OpenAIChatMessage,
} from "@lgrammel/ai-utils/provider/openai";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";

export type CompletionStreamEventHandler = (
  event: CompletionStreamEvent
) => void;

export type CompletionStreamEvent =
  | {
      type: "chunk";
      text: string;
    }
  | {
      type: "start";
    }
  | {
      type: "end";
      result: "success";
      text: string;
    }
  | {
      type: "end";
      result: "failure";
      error: unknown;
    };

export async function streamOpenAIChatCompletion({
  onCompletionStreamEvent,
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  model,
  messages,
  temperature,
  topP,
  n,
  stop,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
  user,
}: {
  onCompletionStreamEvent: CompletionStreamEventHandler;
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: OpenAIChatCompletionModel;
  messages: Array<OpenAIChatMessage>;
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  user?: string;
}) {
  const fetchResponse = await fetch(`${baseUrl}/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      stream: true,
      model,
      messages,
      top_p: topP,
      n,
      stop,
      max_tokens: maxTokens,
      temperature,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      user,
    }),
    signal: abortSignal,
  });

  const decoder = new TextDecoder();

  if (fetchResponse.status !== 200) {
    const result = await fetchResponse.json();

    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || result.statusText
      }`
    );
  }

  let fullMessage = "";

  const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
    if (event.type === "event") {
      const data = event.data;

      try {
        const json = JSON.parse(data);

        // TODO clean ZOD parse
        if (json.choices[0].finish_reason != null) {
          // TODO what about different finish reasons?
          onCompletionStreamEvent({
            type: "end",
            result: "success",
            text: fullMessage,
          });

          return;
        }

        // TODO get role token from delta
        // TODO support multiple choices
        const text = json.choices[0].delta.content;

        if (text != undefined) {
          fullMessage += text;

          onCompletionStreamEvent({
            type: "chunk",
            text,
          });
        }
      } catch (error) {
        // TODO error recovery?
        onCompletionStreamEvent({
          type: "end",
          result: "failure",
          error,
        });
      }
    }
  });

  onCompletionStreamEvent({ type: "start" });

  for await (const chunk of fetchResponse.body as unknown as AsyncIterable<Uint8Array>) {
    parser.feed(decoder.decode(chunk));
  }

  // TODO send end event?
}
