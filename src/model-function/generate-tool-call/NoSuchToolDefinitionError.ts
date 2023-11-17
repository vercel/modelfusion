export class NoSuchToolDefinitionError extends Error {
  readonly toolName: string;
  readonly cause: unknown;
  readonly parameters: unknown;

  constructor({
    toolName,
    parameters,
  }: {
    toolName: string;
    parameters: unknown;
  }) {
    super(
      `Tool definition '${toolName}' not found. ` +
        `Parameters: ${JSON.stringify(parameters)}.`
    );

    this.name = "NoSuchToolDefinitionError";

    this.toolName = toolName;
    this.parameters = parameters;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      toolName: this.toolName,
      parameter: this.parameters,
    };
  }
}
