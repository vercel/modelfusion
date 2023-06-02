import { z } from "zod";
import {
  ResponseHandler,
  createJsonResponseHandler,
  createTextResponseHandler,
  postToApi,
} from "../../../internal/postToApi.js";
import { failedOpenAICallResponseHandler } from "../internal/failedOpenAICallResponseHandler.js";

export type OpenAITranscriptionModelType = "whisper-1";

export type OpenAITranscriptionResponseFormat<T> = {
  type: "json" | "text" | "srt" | "verbose_json" | "vtt";
  handler: ResponseHandler<T>;
};

/**
 * Call the OpenAI Transcription API to generate a transcription from an audio file.
 *
 * @see https://platform.openai.com/docs/api-reference/audio/create
 *
 * @example
 * const transcriptionResponse = await generateOpenAITranscription({
 *   apiKey: openAiApiKey,
 *   model: "whisper-1",
 *   file: {
 *     name: "audio.mp3",
 *     data: fileData, // Buffer
 *   },
 *   responseFormat: generateOpenAITranscription.responseFormat.json,
 * });
 */
export async function generateOpenAITranscription<RESPONSE>({
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
    data: Buffer;
    name: string;
  };
  responseFormat: OpenAITranscriptionResponseFormat<RESPONSE>;
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
    apiKey,
    contentType: null,
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

export type OpenAITranscriptionJson = z.infer<
  typeof openAITranscriptionJsonSchema
>;

export const openAITranscriptionVerboseJsonSchema = z.object({
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
      transient: z.boolean(),
    })
  ),
  text: z.string(),
});

export type OpenAITranscriptionVerboseJson = z.infer<
  typeof openAITranscriptionVerboseJsonSchema
>;

generateOpenAITranscription.responseFormat = {
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
