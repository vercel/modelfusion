import { FlowRun } from "./FlowRun.js";
import { FlowSchema } from "./FlowSchema.js";

export interface Flow<INPUT, EVENT> {
  readonly schema: FlowSchema<INPUT, EVENT>;
  process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
}
