import { z } from "zod";
import { ApiCallError } from "../util/ApiCallError.js";
import { convertReadableStreamToAsyncIterable } from "./convertReadableStreamToAsyncIterable.js";

export type ResponseHandler<T> = (options: {
  url: string;
  requestBodyValues: unknown;
  response: Response;
}) => PromiseLike<T>;

export const createJsonResponseHandler =
  <T>(responseSchema: z.ZodSchema<T>): ResponseHandler<T> =>
  async ({ response }) =>
    responseSchema.parse(await response.json());

export const createStreamResponseHandler =
  (): ResponseHandler<ReadableStream<Uint8Array>> =>
  async ({ response }) =>
    response.body!;

export const createAsyncIterableResponseHandler =
  (): ResponseHandler<AsyncIterable<Uint8Array>> =>
  async ({ response }) =>
    convertReadableStreamToAsyncIterable(response.body!.getReader());

export const createTextResponseHandler =
  (): ResponseHandler<string> =>
  async ({ response }) =>
    response.text();

export const postJsonToApi = async <T>({
  url,
  apiKey,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
}: {
  url: string;
  apiKey: string;
  body: unknown;
  failedResponseHandler: ResponseHandler<ApiCallError>;
  successfulResponseHandler: ResponseHandler<T>;
  abortSignal?: AbortSignal;
}) => {
  return postToApi({
    url,
    apiKey,
    contentType: "application/json",
    body: {
      content: JSON.stringify(body),
      values: body,
    },
    failedResponseHandler,
    successfulResponseHandler,
    abortSignal,
  });
};

export const postToApi = async <T>({
  url,
  apiKey,
  contentType,
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
}: {
  url: string;
  apiKey: string;
  contentType: string | null; // set to null when using FormData (to have correct boundary)
  body: {
    content: string | FormData;
    values: unknown;
  };
  failedResponseHandler: ResponseHandler<Error>;
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
      throw await failedResponseHandler({
        response,
        url,
        requestBodyValues: body.values,
      });
    }

    return await successfulResponseHandler({
      response,
      url,
      requestBodyValues: body.values,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
      }
    }

    throw error;
  }
};
