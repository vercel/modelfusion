export class ChatPromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatPromptValidationError";
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
    };
  }
}
