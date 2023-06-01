import { z } from "zod";
import { ApiCallError } from "../../util/ApiCallError.js";

export const huggingFaceErrorDataSchema = z.object({
  error: z.string(),
});

export type HuggingFaceErrorData = z.infer<typeof huggingFaceErrorDataSchema>;

export class HuggingFaceError extends ApiCallError {
  public readonly data: HuggingFaceErrorData;

  constructor({
    data,
    statusCode,
    url,
    requestBodyValues,
    message = data.error,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    requestBodyValues: unknown;
    data: HuggingFaceErrorData;
  }) {
    super({ message, statusCode, requestBodyValues, url });

    this.data = data;
  }
}
