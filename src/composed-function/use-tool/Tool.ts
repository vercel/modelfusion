import { z } from "zod";
import { SchemaDefinition } from "../../model-function/generate-json/SchemaDefinition.js";

export class Tool<NAME extends string, INPUT, OUTPUT> {
  readonly name: NAME;
  readonly description: string;
  readonly inputSchema: z.ZodSchema<INPUT>;
  readonly execute: (input: INPUT) => PromiseLike<OUTPUT>;

  constructor(options: {
    name: NAME;
    description: string;
    inputSchema: z.ZodSchema<INPUT>;
    execute(input: INPUT): Promise<OUTPUT>;
  }) {
    this.name = options.name;
    this.description = options.description;
    this.inputSchema = options.inputSchema;
    this.execute = options.execute;
  }

  get inputSchemaDefinition(): SchemaDefinition<NAME, INPUT> {
    return {
      name: this.name,
      description: this.description,
      schema: this.inputSchema,
    };
  }
}
