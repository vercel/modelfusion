import { FunctionOptions } from "core";

export interface Retriever<OBJECT, QUERY> {
  // TODO add metadata to return value
  retrieve(query: QUERY, options?: FunctionOptions): Promise<OBJECT[]>;
}
