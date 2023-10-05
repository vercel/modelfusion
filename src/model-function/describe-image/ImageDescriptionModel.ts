import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface ImageDescriptionModelSettings extends ModelSettings {}

export interface ImageDescriptionModel<
  DATA,
  SETTINGS extends
    ImageDescriptionModelSettings = ImageDescriptionModelSettings,
> extends Model<SETTINGS> {
  doDescribeImage: (
    data: DATA,
    options?: FunctionOptions
  ) => PromiseLike<{
    response: unknown;
    description: string;
  }>;
}
