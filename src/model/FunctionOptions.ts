import { RunContext } from "../run/RunContext.js";

export interface FunctionOptions<SETTINGS> {
  functionId?: string;
  settings?: Partial<SETTINGS>;
  run?: RunContext;
}
