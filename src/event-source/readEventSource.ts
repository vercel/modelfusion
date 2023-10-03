import SecureJSON from "secure-json-parse";
import { Schema } from "../core/structure/Schema";

export function readEventSource<T>({
  url,
  schema,
  onEvent,
  onError = console.error,
}: {
  url: string;
  schema: Schema<T>;
  onEvent: (event: T, eventSource: EventSource) => void;
  onError?: (error: unknown, eventSource: EventSource) => void;
}) {
  const eventSource = new EventSource(url);

  eventSource.onmessage = (e) => {
    try {
      const validationResult = schema.validate(SecureJSON.parse(e.data));

      if (!validationResult.success) {
        onError(validationResult.error, eventSource);
        return;
      }

      onEvent(validationResult.value, eventSource);
    } catch (error) {
      onError(error, eventSource);
    }
  };

  eventSource.onerror = (e) => {
    onError(e, eventSource);
  };
}
