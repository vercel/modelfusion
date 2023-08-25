import { RunFunctionOptions } from "../run/RunFunction.js";

export interface FunctionOptions<SETTINGS> extends RunFunctionOptions {
  settings?: Partial<SETTINGS>;
}
