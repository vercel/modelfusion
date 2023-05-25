export class AbortError extends Error {
  constructor(message = "Aborted") {
    super(message);
  }
}
