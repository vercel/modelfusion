import { ModelInformation } from "./ModelInformation.js";
import { FunctionObserver } from "../run/FunctionObserver.js";

export interface ModelSettings {
  /**
   * Observers that are called when the model is used in run functions.
   */
  observers?: Array<FunctionObserver>;
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
   *   maxCompletionTokens: 500,
   * });
   *
   * const modelWithMoreTokens = model.withSettings({
   *   maxCompletionTokens: 1000,
   * });
   */
  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
