export class InvalidToolNameError extends Error {
  readonly toolName: string;

  constructor({
    toolName,
    namePattern,
  }: {
    toolName: string;
    namePattern: RegExp;
  }) {
    super(
      `Invalid tool name '${toolName}'. The tool name must match the regular expression pattern ${namePattern}.`
    );

    this.name = "InvalidToolNameError";
    this.toolName = toolName;
  }
}
