import { z } from "zod";
import SecureJSON from "secure-json-parse";
import { OpenAIError, openAIErrorDataSchema } from "./OpenAIError.js";

export const postToOpenAI = async <T>({
  url,
  apiKey,
  body,
  responseSchema,
  abortSignal,
}: {
  url: string;
  apiKey: string;
  body: unknown;
  responseSchema: z.ZodSchema<T>;
  abortSignal?: AbortSignal;
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (response.status >= 400) {
      const body = await response.text();
      const parsedError = openAIErrorDataSchema.parse(SecureJSON.parse(body));

      throw new OpenAIError({
        statusCode: response.status,
        data: parsedError.error,
      });
    }

    const data = await response.json();

    return responseSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
      }
    }

    // TODO: handle error
    throw error;
  }
};
