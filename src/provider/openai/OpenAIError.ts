import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { ApiCallError } from "../../util/ApiCallError.js";
import { ResponseHandler } from "internal/postToApi.js";

export const openAIErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
    param: z.any().nullable(),
    code: z.string().nullable(),
  }),
});

export type OpenAIErrorData = z.infer<typeof openAIErrorDataSchema>;

export class OpenAIError extends ApiCallError {
  public readonly data: OpenAIErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.error.message,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: OpenAIErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedOpenAICallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedError = openAIErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new OpenAIError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
