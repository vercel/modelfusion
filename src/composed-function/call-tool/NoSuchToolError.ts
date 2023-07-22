export class NoSuchToolError extends Error {
  readonly toolName: string;

  constructor(toolName: string) {
    super(`No such tool: ${toolName}`);

    this.name = "NoSuchToolError";
    this.toolName = toolName;
  }
}
