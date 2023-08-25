import { z } from "zod";
import { ApiCallError } from "./ApiCallError.js";

export type ResponseHandler<T> = (options: {
  url: string;
  requestBodyValues: unknown;
  response: Response;
}) => PromiseLike<T>;

export const createJsonResponseHandler =
  <T>(responseSchema: z.ZodSchema<T>): ResponseHandler<T> =>
  async ({ response, url, requestBodyValues }) => {
    const parsedResult = responseSchema.safeParse(await response.json());

    if (!parsedResult.success) {
      throw new ApiCallError({
        message: "Invalid JSON response",
        cause: parsedResult.error,
        statusCode: response.status,
        url,
        requestBodyValues,
      });
    }

    return parsedResult.data;
  };

export const createTextResponseHandler =
  (): ResponseHandler<string> =>
  async ({ response }) =>
    response.text();

export const createAudioMpegResponseHandler =
  (): ResponseHandler<Buffer> =>
  async ({ response, url, requestBodyValues }) => {
    if (response.headers.get("Content-Type") !== "audio/mpeg") {
      throw new ApiCallError({
        message: "Invalid Content-Type (must be audio/mpeg)",
        statusCode: response.status,
        url,
        requestBodyValues,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  };

export const postJsonToApi = async <T>({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
}: {
  url: string;
  headers?: Record<string, string>;
  body: unknown;
  failedResponseHandler: ResponseHandler<ApiCallError>;
  successfulResponseHandler: ResponseHandler<T>;
  abortSignal?: AbortSignal;
}) =>
  postToApi({
    url,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: {
      content: JSON.stringify(body),
      values: body,
    },
    failedResponseHandler,
    successfulResponseHandler,
    abortSignal,
  });

export const postToApi = async <T>({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
}: {
  url: string;
  headers?: Record<string, string>;
  body: {
    content: string | FormData;
    values: unknown;
  };
  failedResponseHandler: ResponseHandler<Error>;
  successfulResponseHandler: ResponseHandler<T>;
  abortSignal?: AbortSignal;
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body.content,
      signal: abortSignal,
    });

    if (!response.ok) {
      try {
        throw await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values,
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError" || error instanceof ApiCallError) {
            throw error;
          }
        }

        throw new ApiCallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          requestBodyValues: body.values,
        });
      }
    }

    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError" || error instanceof ApiCallError) {
          throw error;
        }
      }

      throw new ApiCallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        requestBodyValues: body.values,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
      }
    }

    // unwrap original error when fetch failed (for easier debugging):
    if (error instanceof TypeError && error.message === "fetch failed") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).cause != null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw (error as any).cause;
      }
    }

    throw error;
  }
};
