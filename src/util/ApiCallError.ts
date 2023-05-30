export class ApiCallError extends Error {
  public readonly url: string;
  public readonly requestBodyValues: unknown;
  public readonly statusCode: number;

  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
  }: {
    message: string;
    url: string;
    requestBodyValues: unknown;
    statusCode: number;
  }) {
    super(message);

    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
  }
}
