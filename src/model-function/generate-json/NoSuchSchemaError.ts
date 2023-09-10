export class NoSuchStructureError extends Error {
  readonly structureName: string;

  constructor(structureName: string) {
    super(`No such structure: ${structureName}`);

    this.name = "NoSuchStructureError";
    this.structureName = structureName;
  }
}
