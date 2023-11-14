import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/structure/ZodSchema.js";
import { parseJSON } from "../../util/parseJSON.js";

export const cohereErrorDataSchema = new ZodSchema(
  z.object({
    message: z.string(),
  })
);

export type CohereErrorData = (typeof cohereErrorDataSchema)["_type"];

export class CohereError extends ApiCallError {
  public readonly data: CohereErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.message,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: CohereErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedCohereCallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  // For some errors, the body of Cohere responses is empty:
  if (responseBody.trim() === "") {
    return new CohereError({
      url,
      requestBodyValues,
      statusCode: response.status,
      data: {
        message: response.statusText,
      },
    });
  }

  const parsedError = parseJSON({
    text: responseBody,
    schema: cohereErrorDataSchema,
  });

  return new CohereError({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
