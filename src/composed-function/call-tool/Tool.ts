import { z } from "zod";

export class Tool<INPUT, OUTPUT> {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: z.ZodSchema<INPUT>;
  readonly run: (input: INPUT) => PromiseLike<OUTPUT>;

  constructor(options: {
    name: string;
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
