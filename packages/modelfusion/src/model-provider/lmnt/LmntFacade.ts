import { LmntSpeechModel, LmntSpeechModelSettings } from "./LmntSpeechModel.js";
import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { LmntApiConfiguration } from "./LmntApiConfiguration.js";

/**
 * Creates an API configuration for the LMNT API.
 * It calls the API at https://api.lmnt.com/v1 and uses the `LMNT_API_KEY` env variable by default.
 */
export function Api(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  }
) {
  return new LmntApiConfiguration(settings);
}

/**
 * Synthesize speech using the LMNT API.
 *
 * @see https://docs.lmnt.com/api-reference/speech/synthesize-speech-1
 *
 * @returns A new instance of {@link LmntSpeechModel}.
 */
export function SpeechGenerator(settings: LmntSpeechModelSettings) {
  return new LmntSpeechModel(settings);
}
