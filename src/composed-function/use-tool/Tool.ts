import { z } from "zod";
import { SchemaDefinition } from "../../model-function/generate-json/SchemaDefinition.js";
import { RunFunction } from "../../run/RunFunction.js";

export class Tool<NAME extends string, INPUT, OUTPUT> {
  readonly name: NAME;
  readonly description: string;
  readonly inputSchema: z.ZodSchema<INPUT>;
  readonly outputSchema?: z.ZodSchema<OUTPUT>;
  readonly execute: RunFunction<INPUT, OUTPUT>;

  constructor(options: {
    name: NAME;
    description: string;
    inputSchema: z.ZodSchema<INPUT>;
    outputSchema?: z.ZodSchema<OUTPUT>;
    execute(input: INPUT): Promise<OUTPUT>;
  }) {
    this.name = options.name;
    this.description = options.description;
    this.inputSchema = options.inputSchema;
    this.outputSchema = options.outputSchema;
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
