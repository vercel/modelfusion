import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  createTextResponseHandler,
  postToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "../../model-function/generate-transcription/TranscriptionModel.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";

/**
 * @see https://openai.com/pricing
 */
export const OPENAI_TRANSCRIPTION_MODELS = {
  "whisper-1": {
    costInMillicentsPerSecond: 10, // = 600 / 60,
  },
};

export type OpenAITranscriptionModelType =
  keyof typeof OPENAI_TRANSCRIPTION_MODELS;

export const calculateOpenAITranscriptionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAITranscriptionModelType;
  response: OpenAITranscriptionVerboseJsonResponse;
}): number | null => {
  if (model !== "whisper-1") {
    return null;
  }

  const durationInSeconds = response.duration;

  return (
    Math.ceil(durationInSeconds) *
    OPENAI_TRANSCRIPTION_MODELS[model].costInMillicentsPerSecond
  );
};

export interface OpenAITranscriptionModelSettings
  extends TranscriptionModelSettings {
  api?: ApiConfiguration;

  /**
   * ID of the model to use. Only whisper-1 is currently available.
   */
  model: OpenAITranscriptionModelType;

  /**
   * The language of the input audio. Supplying the input language in ISO-639-1 format will improve accuracy and latency.
   */
  language?: string; // ISO-639-1 code

  /**
   * The sampling temperature, between 0 and 1.
   * Higher values like 0.8 will make the output more random,
   * while lower values like 0.2 will make it more focused and deterministic.
   * If set to 0, the model will use log probability to automatically
   * increase the temperature until certain thresholds are hit.
   */
  temperature?: number;

  /**
   * An optional text to guide the model's style or continue a previous audio segment. The prompt should match the audio language.
   */
  prompt?: string;
}

export type OpenAITranscriptionInput = {
  type:
    | "flac"
    | "m4a"
    | "mp3"
    | "mp4"
    | "mpeg"
    | "mpga"
    | "ogg"
    | "wav"
    | "webm";
  data: Buffer;
};

/**
 * Create a transcription model that calls the OpenAI transcription API.
 *
 * @see https://platform.openai.com/docs/api-reference/audio/create
 *
 * @example
 * const data = await fs.promises.readFile("data/test.mp3");
 *
 * const transcription = await transcribe(
 *   new OpenAITranscriptionModel({ model: "whisper-1" }),
 *   {
 *     type: "mp3",
 *     data,
 *   }
 * );
 */
export class OpenAITranscriptionModel
  extends AbstractModel<OpenAITranscriptionModelSettings>
  implements
    TranscriptionModel<
      OpenAITranscriptionInput,
      OpenAITranscriptionModelSettings
    >
{
  constructor(settings: OpenAITranscriptionModelSettings) {
    super({ settings });
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  async doTranscribe(
    data: OpenAITranscriptionInput,
    options: FunctionCallOptions
  ) {
    const rawResponse = await this.callAPI(data, options, {
      responseFormat: OpenAITranscriptionResponseFormat.verboseJson,
    });

    return {
      rawResponse,
      transcription: rawResponse.text,
    };
  }

  async callAPI<RESULT>(
    data: OpenAITranscriptionInput,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: OpenAITranscriptionResponseFormatType<RESULT>;
    }
  ): Promise<RESULT> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const abortSignal = callOptions?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () => {
        const fileName = `audio.${data.type}`;

        const formData = new FormData();
        formData.append("file", new Blob([data.data]), fileName);
        formData.append("model", this.settings.model);

        if (this.settings.prompt != null) {
          formData.append("prompt", this.settings.prompt);
        }

        if (options.responseFormat != null) {
          formData.append("response_format", options.responseFormat.type);
        }

        if (this.settings.temperature != null) {
          formData.append("temperature", this.settings.temperature.toString());
        }

        if (this.settings.language != null) {
          formData.append("language", this.settings.language);
        }

        return postToApi({
          url: api.assembleUrl("/audio/transcriptions"),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            content: formData,
            values: {
              model: this.settings.model,
              prompt: this.settings.prompt,
              response_format: options.responseFormat,
              temperature: this.settings.temperature,
              language: this.settings.language,
            },
          },
          failedResponseHandler: failedOpenAICallResponseHandler,
          successfulResponseHandler: options.responseFormat.handler,
          abortSignal,
        });
      },
    });
  }

  get settingsForEvent(): Partial<OpenAITranscriptionModelSettings> {
    return {
      language: this.settings.language,
      temperature: this.settings.temperature,
    };
  }

  withSettings(additionalSettings: OpenAITranscriptionModelSettings) {
    return new OpenAITranscriptionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const openAITranscriptionJsonSchema = z.object({
  text: z.string(),
});

export type OpenAITranscriptionJsonResponse = z.infer<
  typeof openAITranscriptionJsonSchema
>;

const openAITranscriptionVerboseJsonSchema = z.object({
  task: z.literal("transcribe"),
  language: z.string(),
  duration: z.number(),
  segments: z.array(
    z.object({
      id: z.number(),
      seek: z.number(),
      start: z.number(),
      end: z.number(),
      text: z.string(),
      tokens: z.array(z.number()),
      temperature: z.number(),
      avg_logprob: z.number(),
      compression_ratio: z.number(),
      no_speech_prob: z.number(),
      transient: z.boolean().optional(),
    })
  ),
  text: z.string(),
});

export type OpenAITranscriptionVerboseJsonResponse = z.infer<
  typeof openAITranscriptionVerboseJsonSchema
>;

export type OpenAITranscriptionResponseFormatType<T> = {
  type: "json" | "text" | "srt" | "verbose_json" | "vtt";
  handler: ResponseHandler<T>;
};

export const OpenAITranscriptionResponseFormat = {
  json: {
    type: "json" as const,
    handler: createJsonResponseHandler(
      zodSchema(openAITranscriptionJsonSchema)
    ),
  },
  verboseJson: {
    type: "verbose_json" as const,
    handler: createJsonResponseHandler(
      zodSchema(openAITranscriptionVerboseJsonSchema)
    ),
  },
  text: {
    type: "text" as const,
    handler: createTextResponseHandler(),
  },
  srt: {
    type: "srt" as const,
    handler: createTextResponseHandler(),
  },
  vtt: {
    type: "vtt" as const,
    handler: createTextResponseHandler(),
  },
};
