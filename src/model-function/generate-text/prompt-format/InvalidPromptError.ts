/**
 * Error thrown when a prompt validation fails.
 */
export class InvalidPromptError extends Error {
  readonly prompt: unknown;

  constructor(message: string, prompt: unknown) {
    super(message);

    this.name = "InvalidPromptError";
    this.prompt = prompt;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,

      prompt: this.prompt,
    };
  }
}
