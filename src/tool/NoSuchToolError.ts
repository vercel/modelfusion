/**
 * Thrown when a tool is not found.
 *
 * This can mean that the LLM requested to use a tool that has not been defined.
 */
export class NoSuchToolError extends Error {
  readonly toolName: string;

  constructor(toolName: string) {
    super(`Tool '${toolName}' not found.`);

    this.name = "NoSuchToolError";

    this.toolName = toolName;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,

      toolName: this.toolName,
    };
  }
}
