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
 *   lmnt.Speech(...),
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
  options?: FunctionOptions & { returnType?: "buffer" }
): Promise<Buffer>;
export async function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options: FunctionOptions & { returnType: "full" }
): Promise<{ value: Buffer; response: unknown; metadata: ModelCallMetadata }>;
export async function generateSpeech(
  model: SpeechGenerationModel<SpeechGenerationModelSettings>,
  text: string,
  options?: FunctionOptions & { returnType?: "buffer" | "full" }
): Promise<
  Buffer | { value: Buffer; response: unknown; metadata: ModelCallMetadata }
> {
  const fullResponse = await executeStandardCall({
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
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
