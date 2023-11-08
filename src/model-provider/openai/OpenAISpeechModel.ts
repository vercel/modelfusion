import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import {
  SpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "../../model-function/generate-speech/SpeechGenerationModel.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";

/**
 * @see https://openai.com/pricing
 */
export const OPENAI_SPEECH_MODELS = {
  "tts-1": {
    costInMillicentsPerCharacter: 1.5, // = 1500 / 1000,
  },
  "tts-1-hd": {
    costInMillicentsPerCharacter: 3, // = 3000 / 1000
  },
};

export type OpenAISpeechModelType = keyof typeof OPENAI_SPEECH_MODELS;

export const calculateOpenAISpeechCostInMillicents = ({
  model,
  input,
}: {
  model: OpenAISpeechModelType;
  input: string;
}): number | null => {
  if (!OPENAI_SPEECH_MODELS[model]) {
    return null;
  }

  return (
    input.length * OPENAI_SPEECH_MODELS[model].costInMillicentsPerCharacter
  );
};

export type OpenAISpeechVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";
type OpenAISpeechModelResponseFormat = "mp3" | "opus" | "aac" | "flac";

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
  response_format?: OpenAISpeechModelResponseFormat;
}

/**
 * Synthesize speech using the LMNT API.
 *
 * @see https://www.lmnt.com/docs/rest/#synthesize-speech
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
    options?: FunctionOptions
  ): Promise<Buffer> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callOpenAITextToSpeechAPI({
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          text,
        }),
    });
  }

  get settingsForEvent(): Partial<OpenAISpeechModelSettings> {
    return {
      voice: this.settings.voice,
      speed: this.settings.speed,
      model: this.settings.model,
      response_format: this.settings.response_format,
    };
  }

  doGenerateSpeechStandard(text: string, options?: FunctionOptions) {
    return this.callAPI(text, options);
  }

  withSettings(additionalSettings: Partial<OpenAISpeechModelSettings>) {
    return new OpenAISpeechModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}

async function callOpenAITextToSpeechAPI({
  api = new OpenAIApiConfiguration(),
  abortSignal,
  text,
  voice,
  model,
  speed,
  response_format,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  text: string;
  voice: OpenAISpeechVoice;
  model: OpenAISpeechModelType;
  speed?: number;
  response_format?: string;
}): Promise<Buffer> {
  return postJsonToApi({
    url: api.assembleUrl(`/audio/speech`),
    headers: api.headers,
    body: {
      input: text,
      voice,
      speed,
      model,
      response_format,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: createAudioMpegResponseHandler(),
    abortSignal,
  });
}
