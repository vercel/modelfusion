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

export const postJsonToApi = async <T>({
  url,
  apiKey,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
}: {
  url: string;
  apiKey?: string;
  body: unknown;
  failedResponseHandler: ResponseHandler<ApiCallError>;
  successfulResponseHandler: ResponseHandler<T>;
  abortSignal?: AbortSignal;
}) =>
  postToApi({
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
  apiKey?: string;
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
    const headers: Record<string, string> = {};

    if (apiKey !== undefined) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

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

    throw error;
  }
};
