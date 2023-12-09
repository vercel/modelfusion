export class ApiCallError extends Error {
  public readonly url: string;
  public readonly requestBodyValues: unknown;
  public readonly statusCode?: number;
  public readonly responseBody?: string;
  public readonly cause?: unknown;
  public readonly isRetryable: boolean;

  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseBody,
    cause,
    isRetryable = statusCode != null &&
      (statusCode === 429 || statusCode >= 500),
  }: {
    message: string;
    url: string;
    requestBodyValues: unknown;
    statusCode?: number;
    responseBody?: string;
    cause?: unknown;
    isRetryable?: boolean;
  }) {
    super(message);

    this.name = "ApiCallError";

    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.cause = cause;
    this.isRetryable = isRetryable;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      url: this.url,
      requestBodyValues: this.requestBodyValues,
      statusCode: this.statusCode,
      responseBody: this.responseBody,
      cause: this.cause,
      isRetryable: this.isRetryable,
    };
  }
}
