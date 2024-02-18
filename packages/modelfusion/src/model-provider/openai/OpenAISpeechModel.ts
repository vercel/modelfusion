import { FunctionCallOptions } from "../../core/FunctionOptions";
import { ApiConfiguration } from "../../core/api/ApiConfiguration";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle";
import {
  createAudioMpegResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi";
import { AbstractModel } from "../../model-function/AbstractModel";
import {
  SpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "../../model-function/generate-speech/SpeechGenerationModel";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration";
import { failedOpenAICallResponseHandler } from "./OpenAIError";

export type OpenAISpeechVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";
type OpenAISpeechModelResponseFormat = "mp3" | "opus" | "aac" | "flac";

export type OpenAISpeechModelType = "tts-1" | "tts-1-hd";

export interface OpenAISpeechModelSettings
  extends SpeechGenerationModelSettings {
  api?: ApiConfiguration;

  voice: OpenAISpeechVoice;
  model: OpenAISpeechModelType;

  /**
   * The speed of the generated audio. Select a value from 0.25 to 4.0. 1.0 is the default.
   */
  speed?: number;

  /**
   * Defaults to mp3.
   */
  responseFormat?: OpenAISpeechModelResponseFormat;
}

/**
 * Synthesize speech using the OpenAI API.
 *
 * @see https://platform.openai.com/docs/api-reference/audio/createSpeech
 */
export class OpenAISpeechModel
  extends AbstractModel<OpenAISpeechModelSettings>
  implements SpeechGenerationModel<OpenAISpeechModelSettings>
{
  constructor(settings: OpenAISpeechModelSettings) {
    super({ settings });
  }

  readonly provider = "openai" as const;

  get voice() {
    return this.settings.voice;
  }

  get modelName() {
    return this.settings.model;
  }

  private async callAPI(
    text: string,
    callOptions: FunctionCallOptions
  ): Promise<Uint8Array> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/audio/speech`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            input: text,
            voice: this.settings.voice,
            speed: this.settings.speed,
            model: this.settings.model,
            response_format: this.settings.responseFormat,
          },
          failedResponseHandler: failedOpenAICallResponseHandler,
          successfulResponseHandler: createAudioMpegResponseHandler(),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<OpenAISpeechModelSettings> {
    return {
      voice: this.settings.voice,
      speed: this.settings.speed,
      model: this.settings.model,
      responseFormat: this.settings.responseFormat,
    };
  }

  doGenerateSpeechStandard(text: string, options: FunctionCallOptions) {
    return this.callAPI(text, options);
  }

  withSettings(additionalSettings: Partial<OpenAISpeechModelSettings>) {
    return new OpenAISpeechModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}
