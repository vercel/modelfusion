import { Schema } from "../../core/schema/Schema";
import { parseJsonStreamAsAsyncIterable } from "./parseJsonStreamAsAsyncIterable";

export const createJsonStreamResponseHandler =
  <T>(schema: Schema<T>) =>
  ({ response }: { response: Response }) =>
    parseJsonStreamAsAsyncIterable({
      stream: response.body!,
      schema,
    });
