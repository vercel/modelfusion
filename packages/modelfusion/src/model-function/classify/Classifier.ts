import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface ClassifierSettings extends ModelSettings {}

export interface Classifier<
  VALUE,
  CLASS extends string | null,
  SETTINGS extends ClassifierSettings = ClassifierSettings,
> extends Model<SETTINGS> {
  doClassify(
    value: VALUE,
    options: FunctionCallOptions
  ): PromiseLike<{
    rawResponse: unknown | undefined;
    class: CLASS;
  }>;
}
