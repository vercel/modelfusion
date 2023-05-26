import { z } from "zod";
import SecureJSON from "secure-json-parse";
import { OpenAIError, openAIErrorDataSchema } from "./OpenAIError.js";

export type ResponseHandler<T> = (response: Response) => PromiseLike<T>;

export const createJsonResponseHandler =
  <T>(responseSchema: z.ZodSchema<T>): ResponseHandler<T> =>
  async (response) => {
    const data = await response.json();
    return responseSchema.parse(data);
  };

export const createStreamResponseHandler =
  (): ResponseHandler<AsyncIterable<Uint8Array>> => async (response) => {
    return response.body as unknown as AsyncIterable<Uint8Array>;
  };

export const postToOpenAI = async <T>({
  url,
  apiKey,
  body,
  successfulResponseHandler,
  abortSignal,
}: {
  url: string;
  apiKey: string;
  body: unknown;
  successfulResponseHandler: ResponseHandler<T>;
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
      const responseBody = await response.text();
      const parsedError = openAIErrorDataSchema.parse(
        SecureJSON.parse(responseBody)
      );

      throw new OpenAIError({
        url,
        body,
        statusCode: response.status,
        data: parsedError.error,
      });
    }

    return await successfulResponseHandler(response);
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
