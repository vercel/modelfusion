import { z } from "zod";

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
}
