import { Schema } from "../../core/schema/Schema.js";
import { parseJsonStreamAsAsyncIterable } from "./parseJsonStreamAsAsyncIterable.js";

export const createJsonStreamResponseHandler =
  <T>(schema: Schema<T>) =>
  ({ response }: { response: Response }) =>
    parseJsonStreamAsAsyncIterable({
      stream: response.body!,
      schema,
    });
