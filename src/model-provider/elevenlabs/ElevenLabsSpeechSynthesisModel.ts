import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ApiConfiguration } from "../../model-function/ApiConfiguration.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "../../model-function/synthesize-speech/SpeechSynthesisModel.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
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
    options?: ModelFunctionOptions<ElevenLabsSpeechSynthesisModelSettings>
  ): Promise<Buffer> {
    const run = options?.run;
    const settings = options?.settings;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      api: combinedSettings.api,
      abortSignal: run?.abortSignal,
      text,
      voiceId: combinedSettings.voice,
      modelId: combinedSettings.model,
      voiceSettings: combinedSettings.voiceSettings,
    };

    return callWithRetryAndThrottle({
      retry: combinedSettings.api?.retry,
      throttle: combinedSettings.api?.throttle,
      call: async () => callElevenLabsTextToSpeechAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<ElevenLabsSpeechSynthesisModelSettings> {
    return {
      model: this.settings.model,
      voice: this.settings.voice,
      voiceSettings: this.settings.voiceSettings,
    };
  }

  generateSpeechResponse(
    text: string,
    options?:
      | ModelFunctionOptions<ElevenLabsSpeechSynthesisModelSettings>
      | undefined
  ) {
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
