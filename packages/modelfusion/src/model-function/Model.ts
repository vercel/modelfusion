import { ModelInformation } from "./ModelInformation.js";
import { FunctionObserver } from "../core/FunctionObserver.js";

export interface ModelSettings {
  /**
   * Observers that are called when the model is used in run functions.
   */
  observers?: Array<FunctionObserver>;
}

export interface Model<SETTINGS extends ModelSettings> {
  modelInformation: ModelInformation;
  readonly settings: SETTINGS;

  /**
   * Returns settings that should be recorded in observability events.
   * Security-related settings (e.g. API keys) should not be included here.
   */
  get settingsForEvent(): Partial<SETTINGS>;

  /**
   * The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.
   *
   * @example
   * const model = new OpenAICompletionModel({
   *   model: "gpt-3.5-turbo-instruct",
   *   maxGenerationTokens: 500,
   * });
   *
   * const modelWithMoreTokens = model.withSettings({
   *   maxGenerationTokens: 1000,
   * });
   */
  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
