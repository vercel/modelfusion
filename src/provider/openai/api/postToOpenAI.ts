import { z } from "zod";
import SecureJSON from "secure-json-parse";
import { OpenAIError, openAIErrorDataSchema } from "./OpenAIError.js";

export const postToOpenAI = async <T>({
  url,
  apiKey,
  body,
  responseSchema,
}: {
  url: string;
  apiKey: string;
  body: unknown;
  responseSchema: z.ZodSchema<T>;
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
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
    // TODO: handle error
    throw error;
  }
};
