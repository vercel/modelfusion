import { FunctionOptions } from "../core/FunctionOptions";

export interface Retriever<OBJECT, QUERY> {
  // TODO add metadata to return value
  retrieve(query: QUERY, options?: FunctionOptions): Promise<OBJECT[]>;
}
