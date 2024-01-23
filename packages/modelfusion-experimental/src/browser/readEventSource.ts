import { Schema, safeParseJSON } from "modelfusion";

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

      const parseResult = safeParseJSON({ text: event.data, schema });

      if (!parseResult.success) {
        onError(parseResult.error, eventSource);
        return;
      }

      onEvent(parseResult.value, eventSource);
    } catch (error) {
      onError(error, eventSource);
    }
  };

  eventSource.onerror = (e) => {
    onError(e, eventSource);
  };
}
