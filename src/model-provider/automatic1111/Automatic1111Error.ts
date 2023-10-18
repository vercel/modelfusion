import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ResponseHandler } from "../../core/api/postToApi.js";
import { parseJsonWithZod } from "../../util/parseJSON.js";

export const automatic1111ErrorDataSchema = z.object({
  error: z.string(),
  detail: z.string(),
  body: z.string(),
  errors: z.string(),
});

export type Automatic1111ErrorData = z.infer<
  typeof automatic1111ErrorDataSchema
>;

export class Automatic1111Error extends ApiCallError {
  public readonly data: Automatic1111ErrorData;

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
    data: Automatic1111ErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}

export const failedAutomatic1111CallResponseHandler: ResponseHandler<
  ApiCallError
> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  const parsedError = parseJsonWithZod(
    responseBody,
    automatic1111ErrorDataSchema
  );

  return new Automatic1111Error({
    url,
    requestBodyValues,
    statusCode: response.status,
    data: parsedError,
  });
};
