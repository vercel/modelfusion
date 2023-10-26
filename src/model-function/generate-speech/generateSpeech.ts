import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import { executeStandardCall } from "../executeStandardCall.js";
import {
  SpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "./SpeechGenerationModel.js";

/**
 * Synthesizes speech from text. Also called text-to-speech (TTS).
 *
 * @see https://modelfusion.dev/guide/function/generate-speech
 *
 * @example
 * const speech = await generateSpeech(
 *   new LmntSpeechModel(...),
 *   "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
 *    "as The Rolling Stones unveil 'Hackney Diamonds.'
 * );
 *
 * @param {SpeechGenerationModel<SpeechGenerationModelSettings>} model - The speech generation model.
 * @param {string} text - The text to be converted to speech.
 * @param {FunctionOptions} [options] - Optional function options.
 *
 * @returns {ModelFunctionPromise<Buffer>} - A promise that resolves to a buffer containing the synthesized speech.
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
