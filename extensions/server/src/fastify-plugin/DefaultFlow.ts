import { FlowRun } from "./FlowRun";
import { FlowSchema } from "./FlowSchema";

export class DefaultFlow<INPUT, EVENT> {
  readonly schema: FlowSchema<INPUT, EVENT>;

  constructor({
    schema,
    process,
  }: {
    schema: FlowSchema<INPUT, EVENT>;
    process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
  }) {
    this.schema = schema;
    this.process = process;
  }

  process: (options: { input: INPUT; run: FlowRun<EVENT> }) => Promise<void>;
}
