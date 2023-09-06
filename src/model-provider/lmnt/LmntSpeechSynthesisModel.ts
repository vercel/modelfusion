import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "../../model-function/synthesize-speech/SpeechSynthesisModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  postToApi,
} from "../../util/api/postToApi.js";
import { failedLmntCallResponseHandler } from "./LmntError.js";

export interface LmntSpeechSynthesisModelSettings
  extends SpeechSynthesisModelSettings {
  baseUrl?: string;
  apiKey?: string;

  voice: string;
  speed?: number;
  seed?: number;
  length?: number;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
}

export class LmntSpeechSynthesisModel
  extends AbstractModel<LmntSpeechSynthesisModelSettings>
  implements SpeechSynthesisModel<LmntSpeechSynthesisModelSettings>
{
  constructor(settings: LmntSpeechSynthesisModelSettings) {
    super({ settings });
  }

  readonly provider = "lmnt";
  readonly modelName = null;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.LMNT_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No LMNT API key provided. Pass it in the constructor or set the LMNT_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  private async callAPI(
    text: string,
    options?: ModelFunctionOptions<LmntSpeechSynthesisModelSettings>
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
        callLmntTextToSpeechAPI({
          baseUrl: combinedSettings.baseUrl,
          abortSignal: run?.abortSignal,
          apiKey: this.apiKey,
          text,
          voice: combinedSettings.voice,
          speed: combinedSettings.speed,
          seed: combinedSettings.seed,
          length: combinedSettings.length,
        }),
    });
  }

  get settingsForEvent(): Partial<LmntSpeechSynthesisModelSettings> {
    return {
      baseUrl: this.settings.baseUrl,
      voice: this.settings.voice,
      speed: this.settings.speed,
      seed: this.settings.seed,
      length: this.settings.length,
    };
  }

  generateSpeechResponse(
    text: string,
    options?: ModelFunctionOptions<LmntSpeechSynthesisModelSettings> | undefined
  ) {
    return this.callAPI(text, options);
  }

  withSettings(additionalSettings: Partial<LmntSpeechSynthesisModelSettings>) {
    return new LmntSpeechSynthesisModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}

/**
 * @see https://www.lmnt.com/docs/rest/#synthesize-speech
 */
async function callLmntTextToSpeechAPI({
  baseUrl = "https://api.lmnt.com/speech/beta",
  abortSignal,
  apiKey,
  text,
  voice,
  speed,
  seed,
  length,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  text: string;
  voice: string;
  speed?: number;
  seed?: number;
  length?: number;
}): Promise<Buffer> {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("voice", voice);
  formData.append("format", "mp3");
  if (speed != null) formData.append("speed", speed.toString());
  if (seed != null) formData.append("seed", seed.toString());
  if (length != null) formData.append("length", length.toString());

  return postToApi({
    url: `${baseUrl}/synthesize`,
    headers: {
      "X-API-Key": apiKey,
    },
    body: {
      content: formData,
      values: {
        text,
        voice,
        speed,
        seed,
        length,
      },
    },
    failedResponseHandler: failedLmntCallResponseHandler,
    successfulResponseHandler: createAudioMpegResponseHandler(),
    abortSignal,
  });
}
