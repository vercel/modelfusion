import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface ImageDescriptionModelSettings extends ModelSettings {}

export interface ImageDescriptionModel<
  DATA,
  RESPONSE,
  SETTINGS extends ImageDescriptionModelSettings,
> extends Model<SETTINGS> {
  generateImageDescriptionResponse: (
    data: DATA,
    options?: ModelFunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  extractImageDescription: (response: RESPONSE) => string;
}
