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
  postToApi,
} from "../../util/api/postToApi.js";
import { LmntApiConfiguration } from "./LmntApiConfiguration.js";
import { failedLmntCallResponseHandler } from "./LmntError.js";

export interface LmntSpeechSynthesisModelSettings
  extends SpeechSynthesisModelSettings {
  api?: ApiConfiguration;

  voice: string;
  speed?: number;
  seed?: number;
  length?: number;
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

  private async callAPI(
    text: string,
    options?: ModelFunctionOptions<LmntSpeechSynthesisModelSettings>
  ): Promise<Buffer> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = {
      // copied settings:
      ...this.settings,
      ...settings,

      abortSignal: run?.abortSignal,
      text,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callLmntTextToSpeechAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<LmntSpeechSynthesisModelSettings> {
    return {
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
  api = new LmntApiConfiguration(),
  abortSignal,
  text,
  voice,
  speed,
  seed,
  length,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
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
    url: api.assembleUrl(`/synthesize`),
    headers: api.headers,
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
