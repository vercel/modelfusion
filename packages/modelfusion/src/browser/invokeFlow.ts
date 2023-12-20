import { ZodSchema } from "../core/schema/ZodSchema.js";
import { FlowSchema } from "../server/fastify/FlowSchema.js";
import { readEventSource } from "./readEventSource.js";

export async function invokeFlow<INPUT, EVENT>({
  url,
  input,
  schema,
  onEvent,
  onStop,
}: {
  url: string;
  input: INPUT;
  schema: FlowSchema<INPUT, EVENT>;
  onEvent: (event: EVENT, eventSource: EventSource) => void;
  onStop?: (eventSource: EventSource) => void;
}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const eventSourceUrl: string = (await response.json()).url;

  readEventSource({
    url: eventSourceUrl,
    schema: new ZodSchema(schema.events),
    isStopEvent(event) {
      return event.data === "[DONE]";
    },
    onEvent,
    onStop,
  });
}
