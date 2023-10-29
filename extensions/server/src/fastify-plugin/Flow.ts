import { FlowRun } from "./FlowRun";
import { FlowSchema } from "./FlowSchema";

export interface Flow<INPUT, EVENT> {
  readonly schema: FlowSchema<INPUT, EVENT>;
  process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
}
