import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
import {
  ImageDescriptionModel,
  ImageDescriptionModelSettings,
} from "./ImageDescriptionModel.js";

/**
 * Describe an image as text.
 *
 * Depending on the model, this can be used for image captioning, for describing the contents of an image, or for OCR.
 */
export function describeImage<
  DATA,
  RESPONSE,
  SETTINGS extends ImageDescriptionModelSettings,
>(
  model: ImageDescriptionModel<DATA, RESPONSE, SETTINGS>,
  data: DATA,
  options?: ModelFunctionOptions<SETTINGS>
): ModelFunctionPromise<string, RESPONSE> {
  return executeCall({
    functionType: "image-description",
    input: data,
    model,
    options,
    generateResponse: (options) =>
      model.generateImageDescriptionResponse(data, options),
    extractOutputValue: model.extractImageDescription,
  });
}
