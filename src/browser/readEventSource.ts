import { Schema } from "../core/structure/Schema.js";
import { safeParseJsonWithSchema } from "../util/parseJSON.js";

export function readEventSource<T>({
  url,
  schema,
  onEvent,
  onError = console.error,
  onStop,
  isStopEvent,
}: {
  url: string;
  schema: Schema<T>;
  onEvent: (event: T, eventSource: EventSource) => void;
  onError?: (error: unknown, eventSource: EventSource) => void;
  onStop?: (eventSource: EventSource) => void;
  isStopEvent?: (event: MessageEvent<unknown>) => boolean;
}) {
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      if (isStopEvent?.(event)) {
        eventSource.close();
        onStop?.(eventSource);
        return;
      }

      const parseResult = safeParseJsonWithSchema(event.data, schema);

      if (!parseResult.success) {
        onError(parseResult.error, eventSource);
        return;
      }

      onEvent(parseResult.data, eventSource);
    } catch (error) {
      onError(error, eventSource);
    }
  };

  eventSource.onerror = (e) => {
    onError(e, eventSource);
  };
}
