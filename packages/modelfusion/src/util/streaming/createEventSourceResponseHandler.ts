import { Schema } from "../../core/schema/Schema.js";
import { parseEventSourceStreamAsAsyncIterable } from "./parseEventSourceStreamAsAsyncIterable.js";

export const createEventSourceResponseHandler =
  <T>(schema: Schema<T>) =>
  ({ response }: { response: Response }) =>
    parseEventSourceStreamAsAsyncIterable({
      stream: response.body!,
      schema,
    });
