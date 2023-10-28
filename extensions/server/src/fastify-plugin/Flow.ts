import { z } from "zod";
import { FlowRun } from "./FlowRun";

export type Flow<INPUT, EVENT> = {
  readonly inputSchema: z.ZodType<INPUT>;
  readonly eventSchema: z.ZodType<EVENT>;

  process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
};
