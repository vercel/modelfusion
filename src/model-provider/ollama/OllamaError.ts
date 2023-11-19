import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";

const ollamaErrorDataSchema = new ZodSchema(
  z.object({
    error: z.string(),
  })
);

type OllamaErrorData = (typeof ollamaErrorDataSchema)["_type"];

export class OllamaError extends ApiCallError {
  public readonly data: OllamaErrorData;

  constructor({
    statusCode,
    url,
    requestBodyValues,
    data,
    message = data.error,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: OllamaErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedOllamaCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  const parsedError = parseJSON({
    text: responseBody,
    schema: ollamaErrorDataSchema,
  });

  return new OllamaError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
