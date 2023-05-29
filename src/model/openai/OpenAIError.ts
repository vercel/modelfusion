import { ApiCallError } from "../../util/ApiCallError.js";
import { z } from "zod";

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
  public readonly data: OpenAIErrorData["error"];
  public readonly url: string;
  public readonly body: unknown;

  constructor({
    data,
    statusCode,
    url,
    body,
    message = data.message,
  }: {
    message?: string;
    statusCode: number;
    url: string;
    body: unknown;
    data: OpenAIErrorData["error"];
  }) {
    super({ message, statusCode });

    this.data = data;
    this.url = url;
    this.body = body;
  }
}
