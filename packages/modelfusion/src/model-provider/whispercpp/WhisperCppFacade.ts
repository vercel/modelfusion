import {
  WhisperCppApiConfiguration,
  WhisperCppApiConfigurationSettings,
} from "./WhisperCppApiConfiguration.js";
import {
  WhisperCppTranscriptionModel,
  WhisperCppTranscriptionModelSettings,
} from "./WhisperCppTranscriptionModel.js";

export function Transcriber(
  settings: WhisperCppTranscriptionModelSettings = {}
) {
  return new WhisperCppTranscriptionModel(settings);
}

export function Api(settings: WhisperCppApiConfigurationSettings) {
  return new WhisperCppApiConfiguration(settings);
}
