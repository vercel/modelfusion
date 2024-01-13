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
 * const speech = await generateSpeech({
 *   model: lmnt.SpeechGenerator(...),
 *   text: "Good evening, ladies and gentlemen! Exciting news on the airwaves tonight " +
 *    "as The Rolling Stones unveil 'Hackney Diamonds.'
 * });
 *
 * @param {SpeechGenerationModel<SpeechGenerationModelSettings>} model - The speech generation model.
 * @param {string} text - The text to be converted to speech.
 *
 * @returns {Promise<Buffer>} - A promise that resolves to a buffer containing the synthesized speech.
 */
export async function generateSpeech(
  args: {
    model: SpeechGenerationModel<SpeechGenerationModelSettings>;
    text: string;
    fullResponse?: false;
  } & FunctionOptions
): Promise<Buffer>;
export async function generateSpeech(
  args: {
    model: SpeechGenerationModel<SpeechGenerationModelSettings>;
    text: string;
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  speech: Buffer;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateSpeech({
  model,
  text,
  fullResponse,
  ...options
}: {
  model: SpeechGenerationModel<SpeechGenerationModelSettings>;
  text: string;
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  Buffer | { speech: Buffer; rawResponse: unknown; metadata: ModelCallMetadata }
> {
  const callResponse = await executeStandardCall({
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

  return fullResponse
    ? {
        speech: callResponse.value,
        rawResponse: callResponse.rawResponse,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
