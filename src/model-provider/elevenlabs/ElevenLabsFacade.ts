import {
  ElevenLabsSpeechModel,
  ElevenLabsSpeechModelSettings,
} from "./ElevenLabsSpeechModel.js";

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
export function Speech(settings: ElevenLabsSpeechModelSettings) {
  return new ElevenLabsSpeechModel(settings);
}
