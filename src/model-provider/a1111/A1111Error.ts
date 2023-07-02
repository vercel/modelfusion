import { z } from "zod";
import { ApiCallError } from "../../util/api/ApiCallError.js";

export const a1111ErrorDataSchema = z.object({
  message: z.string(),
});

export type A1111ErrorData = z.infer<typeof a1111ErrorDataSchema>;

export class A1111Error extends ApiCallError {
  public readonly data: A1111ErrorData;

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
    data: A1111ErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}
