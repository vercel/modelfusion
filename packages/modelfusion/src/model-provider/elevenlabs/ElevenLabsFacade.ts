import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { ElevenLabsApiConfiguration } from "./ElevenLabsApiConfiguration.js";
import {
  ElevenLabsSpeechModel,
  ElevenLabsSpeechModelSettings,
} from "./ElevenLabsSpeechModel.js";

/**
 * Creates an API configuration for the ElevenLabs API.
 * It calls the API at https://api.elevenlabs.io/v1 and uses the `ELEVENLABS_API_KEY` env variable by default.
 */
export function Api(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  }
) {
  return new ElevenLabsApiConfiguration(settings);
}

/**
 * Synthesize speech using the ElevenLabs Text to Speech API.
 *
 * Both regular text-to-speech and full duplex text-to-speech streaming are supported.
 *
 * @see https://docs.elevenlabs.io/api-reference/text-to-speech
 * @see https://docs.elevenlabs.io/api-reference/text-to-speech-websockets
 *
 * @returns A new instance of {@link ElevenLabsSpeechModel}.
 */
export function SpeechGenerator(settings: ElevenLabsSpeechModelSettings) {
  return new ElevenLabsSpeechModel(settings);
}
