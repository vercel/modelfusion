import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";
import { Retriever, RetrieverSettings } from "./Retriever.js";

export async function retrieve<
  OBJECT,
  QUERY,
  SETTINGS extends RetrieverSettings,
>(
  retriever: Retriever<OBJECT, QUERY, SETTINGS>,
  query: QUERY,
  options?: ModelFunctionOptions<SETTINGS>
): Promise<OBJECT[]> {
  // TODO add error handling, events, duration tracking, etc.
  // TODO metadata handling
  return retriever.retrieveObjects(query, options);
}
