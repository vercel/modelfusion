import { z } from "zod";
import { FlowRun } from "./FlowRun";

export class DefaultFlow<INPUT, EVENT> {
  readonly inputSchema: z.ZodType<INPUT>;
  readonly eventSchema: z.ZodType<EVENT>;

  constructor({
    inputSchema,
    eventSchema,
    process,
  }: {
    inputSchema: z.ZodType<INPUT>;
    eventSchema: z.ZodType<EVENT>;
    process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
  }) {
    this.inputSchema = inputSchema;
    this.eventSchema = eventSchema;
    this.process = process;
  }

  process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
}
