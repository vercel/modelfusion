import { ModelFunctionOptions } from "../model-function/ModelFunctionOptions.js";

export interface RetrieverSettings {}

export interface Retriever<OBJECT, QUERY, SETTINGS extends RetrieverSettings> {
  // TODO add metadata to return value
  retrieve(
    query: QUERY,
    options?: ModelFunctionOptions<RetrieverSettings>
  ): Promise<OBJECT[]>;

  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
