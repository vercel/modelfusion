export class NoSuchSchemaError extends Error {
  readonly schemaName: string;

  constructor(schemaName: string) {
    super(`No such schema: ${schemaName}`);

    this.name = "NoSuchSchemaError";
    this.schemaName = schemaName;
  }
}
