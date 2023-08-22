import { AbstractModel } from "../../model-function/AbstractModel.js";
import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "../../model-function/synthesize-speech/SpeechSynthesisModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedElevenLabsCallResponseHandler } from "./ElevenLabsError.js";

export interface ElevenLabsSpeechSynthesisModelSettings
  extends SpeechSynthesisModelSettings {
  voice: string;

  baseUrl?: string;
  apiKey?: string;

  model?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
}

export class ElevenLabsSpeechSynthesisModel
  extends AbstractModel<ElevenLabsSpeechSynthesisModelSettings>
  implements SpeechSynthesisModel<ElevenLabsSpeechSynthesisModelSettings>
{
  constructor(settings: ElevenLabsSpeechSynthesisModelSettings) {
    super({ settings });
  }

  readonly provider = "elevenlabs";
  readonly modelName = null;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.ELEVENLABS_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No ElevenLabs API key provided. Pass it in the constructor or set the ELEVENLABS_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  private async callAPI(
    text: string,
    options?: FunctionOptions<ElevenLabsSpeechSynthesisModelSettings>
  ): Promise<Buffer> {
    const run = options?.run;
    const settings = options?.settings;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callElevenLabsTextToSpeechAPI({
          baseUrl: combinedSettings.baseUrl,
          abortSignal: run?.abortSignal,
          apiKey: this.apiKey,
          text,
          voiceId: combinedSettings.voice,
          modelId: combinedSettings.model,
          voiceSettings: combinedSettings.voiceSettings,
        }),
    });
  }

  generateSpeechResponse(
    text: string,
    options?:
      | FunctionOptions<ElevenLabsSpeechSynthesisModelSettings>
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

/**
 * @see https://api.elevenlabs.io/docs#/text-to-speech/Text_to_speech_v1_text_to_speech__voice_id__post
 */
async function callElevenLabsTextToSpeechAPI({
  baseUrl = "https://api.elevenlabs.io/v1",
  abortSignal,
  apiKey,
  text,
  voiceId,
  modelId,
  voiceSettings,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
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
    url: `${baseUrl}/text-to-speech/${voiceId}`,
    headers: {
      "xi-api-key": apiKey,
    },
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
