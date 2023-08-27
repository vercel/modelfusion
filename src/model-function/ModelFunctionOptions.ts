import { FunctionOptions } from "../core/FunctionOptions.js";

export interface ModelFunctionOptions<SETTINGS> extends FunctionOptions {
  settings?: Partial<SETTINGS>;
}
