import { z } from "zod";
import { ApiCallError } from "../../util/api/ApiCallError.js";

export const stabilityErrorDataSchema = z.object({
  message: z.string(),
});

export type StabilityErrorData = z.infer<typeof stabilityErrorDataSchema>;

export class StabilityError extends ApiCallError {
  public readonly data: StabilityErrorData;

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
    data: StabilityErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}
