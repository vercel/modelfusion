import { RunObserver } from "../run/RunObserver.js";

export interface BaseModelSettings {
  uncaughtErrorHandler?: (error: unknown) => void;
  observers?: Array<RunObserver>;
}
