import { executeFunctionCall } from "../core/executeFunctionCall.js";
import { FunctionOptions } from "../core/FunctionOptions.js";
import { Retriever } from "./Retriever.js";

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
