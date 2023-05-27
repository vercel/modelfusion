import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { OpenAIError, openAIErrorDataSchema } from "../OpenAIError.js";

export type OpenAITranscriptionModelType = "whisper-1";

const OpenAITranscriptionSchema = z.object({
  text: z.string(),
});

export type OpenAITranscription = z.infer<typeof OpenAITranscriptionSchema>;

export async function generateOpenAITranscription({
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
  prompt?: string;
  responseFormat?: "json" | "text" | "srt" | "verbose_json" | "vtt"; // response format determines parsing and return type
  temperature?: number;
  language?: string; // ISO-639-1 code
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", new Blob([file.data]), file.name);
  formData.append("model", model);

  if (prompt) {
    formData.append("prompt", prompt);
  }

  if (responseFormat) {
    formData.append("response_format", responseFormat);
  }

  if (temperature) {
    formData.append("temperature", temperature.toString());
  }

  if (language) {
    formData.append("language", language);
  }

  const url = `${baseUrl}/audio/transcriptions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    signal: abortSignal,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    const parsedError = openAIErrorDataSchema.parse(
      SecureJSON.parse(responseBody)
    );

    throw new OpenAIError({
      url,
      body: formData,
      statusCode: response.status,
      data: parsedError.error,
    });
  }

  return await response.text();
}
