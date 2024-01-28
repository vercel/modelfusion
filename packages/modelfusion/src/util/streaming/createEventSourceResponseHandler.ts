import { Schema } from "../../core/schema/Schema";
import { parseEventSourceStreamAsAsyncIterable } from "./parseEventSourceStreamAsAsyncIterable";

export const createEventSourceResponseHandler =
  <T>(schema: Schema<T>) =>
  ({ response }: { response: Response }) =>
    parseEventSourceStreamAsAsyncIterable({
      stream: response.body!,
      schema,
    });
