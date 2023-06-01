export class ApiCallError extends Error {
  public readonly url: string;
  public readonly requestBodyValues: unknown;
  public readonly statusCode: number;
  public readonly cause?: unknown;

  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    cause,
  }: {
    message: string;
    url: string;
    requestBodyValues: unknown;
    statusCode: number;
    cause?: unknown;
  }) {
    super(message);

    this.name = "ApiCallError";

    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.cause = cause;
  }
}
