import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import {
  ImageDescriptionModel,
  ImageDescriptionModelSettings,
} from "./ImageDescriptionModel.js";

/**
 * Describe an image as text.
 *
 * Depending on the model, this can be used for image captioning, for describing the contents of an image, or for OCR.
 */
export function describeImage<DATA>(
  model: ImageDescriptionModel<DATA, ImageDescriptionModelSettings>,
  data: DATA,
  options?: FunctionOptions
): ModelFunctionPromise<string> {
  return new ModelFunctionPromise(
    executeCall({
      functionType: "image-description",
      input: data,
      model,
      options,
      generateResponse: async (options) => {
        const result = await model.doDescribeImage(data, options);
        return {
          response: result.response,
          extractedValue: result.description,
        };
      },
    })
  );
}
