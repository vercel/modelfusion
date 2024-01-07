import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
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
 *   lmnt.SpeechGenerator(...),
 *   "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
 *    "as The Rolling Stones unveil 'Hackney Diamonds.'
 * );
 *
 * @param {SpeechGenerationModel<SpeechGenerationModelSettings>} model - The speech generation model.
 * @param {string} text - The text to be converted to speech.
 * @param {FunctionOptions} [options] - Optional function options.
 *
 * @returns {Promise<Buffer>} - A promise that resolves to a buffer containing the synthesized speech.
 */
export async function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options?: FunctionOptions & { fullResponse?: false }
): Promise<Buffer>;
export async function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options: FunctionOptions & { fullResponse: true }
): Promise<{
  speech: Buffer;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options?: FunctionOptions & { fullResponse?: boolean }
): Promise<
  Buffer | { speech: Buffer; rawResponse: unknown; metadata: ModelCallMetadata }
> {
  const fullResponse = await executeStandardCall({
    functionType: "generate-speech",
    input: text,
    model,
    options,
    generateResponse: async (options) => {
      const response = await model.doGenerateSpeechStandard(text, options);

      return {
        rawResponse: response,
        extractedValue: response,
      };
    },
  });

  return options?.fullResponse
    ? {
        speech: fullResponse.value,
        rawResponse: fullResponse.rawResponse,
        metadata: fullResponse.metadata,
      }
    : fullResponse.value;
}
