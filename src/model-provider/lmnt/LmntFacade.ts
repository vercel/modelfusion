import { LmntSpeechModel, LmntSpeechModelSettings } from "./LmntSpeechModel.js";

/**
 * Synthesize speech using the LMNT API.
 *
 * @see https://www.lmnt.com/docs/rest/#synthesize-speech
 *
 * @returns A new instance of {@link LmntSpeechModel}.
 */
export function Speech(settings: LmntSpeechModelSettings) {
  return new LmntSpeechModel(settings);
}
