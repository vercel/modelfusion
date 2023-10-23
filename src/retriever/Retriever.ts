import { FunctionOptions } from "../core/FunctionOptions";

export interface Retriever<OBJECT, QUERY> {
  retrieve(query: QUERY, options?: FunctionOptions): Promise<OBJECT[]>;
}
