export class ApiCallError extends Error {
  public readonly statusCode: number;

  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode: number;
  }) {
    super(message);

    this.statusCode = statusCode;
  }
}
