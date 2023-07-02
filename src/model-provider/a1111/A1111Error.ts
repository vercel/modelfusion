import { z } from "zod";
import SecureJSON from "secure-json-parse";
import { ResponseHandler } from "../../util/api/postToApi.js";
import { ApiCallError } from "../../util/api/ApiCallError.js";

export const a1111ErrorDataSchema = z.object({
  error: z.string(),
  detail: z.string(),
  body: z.string(),
  errors: z.string(),
});

export type A1111ErrorData = z.infer<typeof a1111ErrorDataSchema>;

export class A1111Error extends ApiCallError {
  public readonly data: A1111ErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.detail,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: A1111ErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedA1111CallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  const parsedError = a1111ErrorDataSchema.parse(
    SecureJSON.parse(responseBody)
  );

  return new A1111Error({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
