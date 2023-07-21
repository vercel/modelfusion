import { z } from "zod";

export class Tool<NAME extends string, INPUT, OUTPUT> {
  readonly name: NAME;
  readonly description: string;
  readonly inputSchema: z.ZodSchema<INPUT>;
  readonly run: (input: INPUT) => PromiseLike<OUTPUT>;

  constructor(options: {
    name: NAME;
    description: string;
    inputSchema: z.ZodSchema<INPUT>;
    run(input: INPUT): Promise<OUTPUT>;
  }) {
    this.name = options.name;
    this.description = options.description;
    this.inputSchema = options.inputSchema;
    this.run = options.run;
  }
}
