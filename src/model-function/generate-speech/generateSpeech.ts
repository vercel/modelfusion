import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  SpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "./SpeechGenerationModel.js";

/**
 * Synthesizes speech from text.
 */
export function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options?: FunctionOptions
): ModelFunctionPromise<Buffer> {
  return new ModelFunctionPromise(
    executeStandardCall({
      functionType: "generate-speech",
      input: text,
      model,
      options,
      generateResponse: async (options) => {
        const response = await model.doGenerateSpeechStandard(text, options);

        return {
          response,
          extractedValue: response,
        };
      },
    })
  );
}
