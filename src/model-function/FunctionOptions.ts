import { Run } from "../run/Run.js";

export interface FunctionOptions<SETTINGS> {
  functionId?: string;
  settings?: Partial<SETTINGS>;
  run?: Run;
}
