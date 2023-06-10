import { RunObserver } from "../run/RunObserver.js";

export interface ModelSettings {
  uncaughtErrorHandler?: (error: unknown) => void;
  observers?: Array<RunObserver>;
}

export interface Model<SETTINGS> {
  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
