import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  createTextErrorResponseHandler,
  postToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import {
  SpeechGenerationModel,
  SpeechGenerationModelSettings,
} from "../../model-function/generate-speech/SpeechGenerationModel.js";
import { LmntApiConfiguration } from "./LmntApiConfiguration.js";

export interface LmntSpeechModelSettings extends SpeechGenerationModelSettings {
  api?: ApiConfiguration;

  /**
   * The voice id of the voice to use for synthesis.
   */
  voice: string;

  /**
   * The talking speed of the generated speech. A Floating point value between 0.25 (slow) and 2.0 (fast); defaults to 1.0
   */
  speed?: number;

  /**
   * Seed used to specify a different take; defaults to random
   */
  seed?: number;

  /**
   * Produce speech of this length in seconds; maximum 300.0 (5 minutes)
   */
  length?: number;
}

/**
 * Synthesize speech using the LMNT API.
 *
 * @see https://docs.lmnt.com/api-reference/speech/synthesize-speech-1
 */
export class LmntSpeechModel
  extends AbstractModel<LmntSpeechModelSettings>
  implements SpeechGenerationModel<LmntSpeechModelSettings>
{
  constructor(settings: LmntSpeechModelSettings) {
    super({ settings });
  }

  readonly provider = "lmnt";

  get modelName() {
    return this.settings.voice;
  }

  private async callAPI(
    text: string,
    callOptions: FunctionCallOptions
  ): Promise<LmntSpeechResponse> {
    const api = this.settings.api ?? new LmntApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () => {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("voice", this.settings.voice);
        formData.append("format", "mp3");
        formData.append("return_durations", "true");

        if (this.settings.speed != null) {
          formData.append("speed", this.settings.speed.toString());
        }
        if (this.settings.seed != null) {
          formData.append("seed", this.settings.seed.toString());
        }
        if (this.settings.length != null) {
          formData.append("length", this.settings.length.toString());
        }

        return postToApi({
          url: api.assembleUrl(`/ai/speech`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            content: formData,
            values: {
              text,
              voice: this.settings.voice,
              speed: this.settings.speed,
              seed: this.settings.seed,
              length: this.settings.length,
            },
          },
          failedResponseHandler: createTextErrorResponseHandler(),
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(lmntSpeechResponseSchema)
          ),
          abortSignal,
        });
      },
    });
  }

  get settingsForEvent(): Partial<LmntSpeechModelSettings> {
    return {
      voice: this.settings.voice,
      speed: this.settings.speed,
      seed: this.settings.seed,
      length: this.settings.length,
    };
  }

  async doGenerateSpeechStandard(text: string, options: FunctionCallOptions) {
    const response = await this.callAPI(text, options);
    return Buffer.from(response.audio, "base64");
  }

  withSettings(additionalSettings: Partial<LmntSpeechModelSettings>) {
    return new LmntSpeechModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}

const lmntSpeechResponseSchema = z.object({
  audio: z.string(),
  durations: z.array(
    z.object({
      duration: z.number(),
      start: z.number(),
      text: z.string(),
    })
  ),
  seed: z.number(),
});

export type LmntSpeechResponse = z.infer<typeof lmntSpeechResponseSchema>;
