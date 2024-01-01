import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { WhisperCppApiConfiguration } from "./WhisperCppApiConfiguration.js";
import {
  WhisperCppTranscriptionModel,
  WhisperCppTranscriptionModelSettings,
} from "./WhisperCppTranscriptionModel.js";

/**
 * Creates an API configuration for the Whisper.cpp server.
 * It calls the API at http://127.0.0.1:8080 by default.
 */
export function Api(settings: PartialBaseUrlPartsApiConfigurationOptions) {
  return new WhisperCppApiConfiguration(settings);
}

export function Transcriber(
  settings: WhisperCppTranscriptionModelSettings = {}
) {
  return new WhisperCppTranscriptionModel(settings);
}
