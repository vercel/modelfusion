export type RetryErrorReason =
  | "maxTriesExceeded"
  | "errorNotRetryable"
  | "abort";

export class RetryError extends Error {
  readonly errors: Array<unknown>;
  readonly reason: RetryErrorReason;

  constructor({
    message,
    reason,
    errors,
  }: {
    message: string;
    reason: RetryErrorReason;
    errors: Array<unknown>;
  }) {
    super(message);

    this.name = "RetryError";
    this.reason = reason;
    this.errors = errors;
  }
}
