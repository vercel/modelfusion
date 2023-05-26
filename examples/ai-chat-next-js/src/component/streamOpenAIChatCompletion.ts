import {
  OpenAIChatCompletionModel,
  OpenAIChatMessage,
  streamOpenAIChatCompletion,
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

export async function streamOpenAIChatCompletionX({
  onCompletionStreamEvent,
  apiKey,
  model,
  messages,
}: {
  onCompletionStreamEvent: CompletionStreamEventHandler;
  apiKey: string;
  model: OpenAIChatCompletionModel;
  messages: Array<OpenAIChatMessage>;
}) {
  const stream = await streamOpenAIChatCompletion({
    apiKey,
    model,
    messages,
  });

  const decoder = new TextDecoder();

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

  for await (const chunk of stream) {
    parser.feed(decoder.decode(chunk));
  }

  // TODO send end event?
}
