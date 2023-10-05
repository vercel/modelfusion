import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "../../model-function/synthesize-speech/SpeechSynthesisModel.js";
import { ElevenLabsApiConfiguration } from "./ElevenLabsApiConfiguration.js";
import { failedElevenLabsCallResponseHandler } from "./ElevenLabsError.js";

export interface ElevenLabsSpeechSynthesisModelSettings
  extends SpeechSynthesisModelSettings {
  api?: ApiConfiguration;

  voice: string;

  model?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

/**
 * Synthesize speech using the ElevenLabs Text to Speech API.
 *
 * @see https://api.elevenlabs.io/docs#/text-to-speech/Text_to_speech_v1_text_to_speech__voice_id__post
 */
export class ElevenLabsSpeechSynthesisModel
  extends AbstractModel<ElevenLabsSpeechSynthesisModelSettings>
  implements SpeechSynthesisModel<ElevenLabsSpeechSynthesisModelSettings>
{
  constructor(settings: ElevenLabsSpeechSynthesisModelSettings) {
    super({ settings });
  }

  readonly provider = "elevenlabs";

  get modelName() {
    return this.settings.voice;
  }

  private async callAPI(
    text: string,
    options?: FunctionOptions
  ): Promise<Buffer> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callElevenLabsTextToSpeechAPI({
          api: this.settings.api,
          abortSignal: options?.run?.abortSignal,
          text,
          voiceId: this.settings.voice,
          modelId: this.settings.model,
          voiceSettings: this.settings.voiceSettings,
        }),
    });
  }

  get settingsForEvent(): Partial<ElevenLabsSpeechSynthesisModelSettings> {
    return {
      model: this.settings.model,
      voice: this.settings.voice,
      voiceSettings: this.settings.voiceSettings,
    };
  }

  generateSpeechResponse(text: string, options?: FunctionOptions) {
    return this.callAPI(text, options);
  }

  withSettings(
    additionalSettings: Partial<ElevenLabsSpeechSynthesisModelSettings>
  ) {
    return new ElevenLabsSpeechSynthesisModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}

async function callElevenLabsTextToSpeechAPI({
  api = new ElevenLabsApiConfiguration(),
  abortSignal,
  text,
  voiceId,
  modelId,
  voiceSettings,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}): Promise<Buffer> {
  return postJsonToApi({
    url: api.assembleUrl(`/text-to-speech/${voiceId}`),
    headers: api.headers,
    body: {
      text,
      model_id: modelId,
      voice_settings:
        voiceSettings != null
          ? {
              stability: voiceSettings.stability,
              similarity_boost: voiceSettings.similarityBoost,
              style: voiceSettings.style,
              use_speaker_boost: voiceSettings.useSpeakerBoost,
            }
          : undefined,
    },
    failedResponseHandler: failedElevenLabsCallResponseHandler,
    successfulResponseHandler: createAudioMpegResponseHandler(),
    abortSignal,
  });
}
