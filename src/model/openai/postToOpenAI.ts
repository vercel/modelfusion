import { z } from "zod";
import SecureJSON from "secure-json-parse";
import { OpenAIError, openAIErrorDataSchema } from "./OpenAIError.js";

export type ResponseHandler<T> = (response: Response) => PromiseLike<T>;

export const createJsonResponseHandler =
  <T>(responseSchema: z.ZodSchema<T>): ResponseHandler<T> =>
  async (response) =>
    responseSchema.parse(await response.json());

export const createStreamResponseHandler =
  (): ResponseHandler<AsyncIterable<Uint8Array>> => async (response) =>
    response.body as unknown as AsyncIterable<Uint8Array>;

export const createTextResponseHandler =
  (): ResponseHandler<string> => async (response) =>
    response.text();

export const postJsonToOpenAI = async <T>({
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
  return postToOpenAI({
    url,
    apiKey,
    contentType: "application/json",
    body: {
      content: JSON.stringify(body),
      values: body,
    },
    successfulResponseHandler,
    abortSignal,
  });
};

export const postToOpenAI = async <T>({
  url,
  apiKey,
  contentType,
  body,
  successfulResponseHandler,
  abortSignal,
}: {
  url: string;
  apiKey: string;
  contentType: string | null; // set to null when using FormData (to have correct boundary)
  body: {
    content: string | FormData;
    values: unknown;
  };
  successfulResponseHandler: ResponseHandler<T>;
  abortSignal?: AbortSignal;
}) => {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };

    if (contentType !== null) {
      headers["Content-Type"] = contentType;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body.content,
      signal: abortSignal,
    });

    if (!response.ok) {
      const responseBody = await response.text();
      const parsedError = openAIErrorDataSchema.parse(
        SecureJSON.parse(responseBody)
      );

      throw new OpenAIError({
        url,
        body: body.values,
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

    throw error;
  }
};
