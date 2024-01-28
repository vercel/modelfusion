import { executeFunctionCall } from "../core/executeFunctionCall";
import { FunctionOptions } from "../core/FunctionOptions";
import { Retriever } from "./Retriever";

export async function retrieve<OBJECT, QUERY>(
  retriever: Retriever<OBJECT, QUERY>,
  query: QUERY,
  options?: FunctionOptions
): Promise<OBJECT[]> {
  return executeFunctionCall({
    options,
    input: query,
    functionType: "retrieve",
    execute: (options) => retriever.retrieve(query, options),
    inputPropertyName: "query",
    outputPropertyName: "results",
  });
}
