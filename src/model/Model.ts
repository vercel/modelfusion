import { ModelInformation } from "../run/ModelInformation.js";
import { RunObserver } from "../run/RunObserver.js";

export interface ModelSettings {
  uncaughtErrorHandler?: (error: unknown) => void;
  observers?: Array<RunObserver>;
}

export interface Model<SETTINGS> {
  modelInformation: ModelInformation;
  readonly settings: SETTINGS;

  /**
   * The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.
   *
   * @example
   * const model = new OpenAITextGenerationModel({
   *   model: "text-davinci-003",
   *   maxTokens: 500,
   * });
   *
   * const modelWithMoreTokens = model.withSettings({
   *   maxTokens: 1000,
   * });
   */
  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
