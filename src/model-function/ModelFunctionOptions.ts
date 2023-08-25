import { FunctionOptions } from "../run/FunctionOptions.js";

export interface ModelFunctionOptions<SETTINGS> extends FunctionOptions {
  settings?: Partial<SETTINGS>;
}
