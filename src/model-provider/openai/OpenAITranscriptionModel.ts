import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "../../model-function/transcribe-speech/TranscriptionModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  createTextResponseHandler,
  postToApi,
} from "../../util/api/postToApi.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";
import { OpenAIModelSettings } from "./OpenAIModelSettings.js";

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
  model: OpenAITranscriptionModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
}

export type OpenAITranscriptionInput = {
  type: "mp3" | "mp4" | "mpeg" | "mpga" | "m3a" | "wav" | "webm";
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
      OpenAITranscriptionVerboseJsonResponse,
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

  generateTranscriptionResponse(
    data: OpenAITranscriptionInput,
    options?: FunctionOptions<
      Partial<OpenAITranscriptionModelSettings & OpenAIModelSettings>
    >
  ): PromiseLike<OpenAITranscriptionVerboseJsonResponse> {
    return this.callAPI(data, {
      responseFormat: OpenAITranscriptionResponseFormat.verboseJson,
      functionId: options?.functionId,
      settings: options?.settings,
      run: options?.run,
    });
  }

  extractTranscriptionText(
    response: OpenAITranscriptionVerboseJsonResponse
  ): string {
    return response.text;
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  async callAPI<RESULT>(
    data: OpenAITranscriptionInput,
    options: {
      responseFormat: OpenAITranscriptionResponseFormatType<RESULT>;
    } & FunctionOptions<
      Partial<OpenAITranscriptionModelSettings & OpenAIModelSettings>
    >
  ): Promise<RESULT> {
    const run = options?.run;
    const settings = options?.settings;
    const responseFormat = options?.responseFormat;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        file: {
          name: `audio.${data.type}`,
          data: data.data,
        },
        responseFormat,
      }
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callOpenAITranscriptionAPI(callSettings),
    });
  }

  withSettings(additionalSettings: OpenAITranscriptionModelSettings) {
    return new OpenAITranscriptionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

/**
 * Call the OpenAI Transcription API to generate a transcription from an audio file.
 *
 * @see https://platform.openai.com/docs/api-reference/audio/create
 *
 * @example
 * const transcriptionResponse = await callOpenAITranscriptionAPI({
 *   apiKey: openAiApiKey,
 *   model: "whisper-1",
 *   file: {
 *     name: "audio.mp3",
 *     data: fileData, // Buffer
 *   },
 *   responseFormat: callOpenAITranscriptionAPI.responseFormat.json,
 * });
 */
async function callOpenAITranscriptionAPI<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  model,
  file,
  prompt,
  responseFormat,
  temperature,
  language,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: OpenAITranscriptionModelType;
  file: {
    name: string;
    data: Buffer;
  };
  responseFormat: OpenAITranscriptionResponseFormatType<RESPONSE>;
  prompt?: string;
  temperature?: number;
  language?: string; // ISO-639-1 code
}): Promise<RESPONSE> {
  const formData = new FormData();
  formData.append("file", new Blob([file.data]), file.name);
  formData.append("model", model);

  if (prompt) {
    formData.append("prompt", prompt);
  }

  if (responseFormat) {
    formData.append("response_format", responseFormat.type);
  }

  if (temperature) {
    formData.append("temperature", temperature.toString());
  }

  if (language) {
    formData.append("language", language);
  }

  return postToApi({
    url: `${baseUrl}/audio/transcriptions`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      content: formData,
      values: {
        model,
        prompt,
        response_format: responseFormat,
        temperature,
        language,
      },
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
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
    handler: createJsonResponseHandler(openAITranscriptionJsonSchema),
  },
  verboseJson: {
    type: "verbose_json" as const,
    handler: createJsonResponseHandler(openAITranscriptionVerboseJsonSchema),
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
