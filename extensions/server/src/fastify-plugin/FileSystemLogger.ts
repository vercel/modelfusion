import { FunctionEvent } from "modelfusion";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { FlowRun } from "./FlowRun";
import { Logger } from "./Logger";

export class FileSystemLogger implements Logger {
  private readonly logPath: (run: FlowRun<unknown>) => string;

  constructor({ path }: { path: (run: FlowRun<unknown>) => string }) {
    this.logPath = path;
  }

  async logFunctionEvent({
    run,
    event,
  }: {
    run: FlowRun<unknown>;
    event: FunctionEvent;
  }): Promise<void> {
    const timestamp = event.startTimestamp.getTime();
    try {
      const logPath = this.logPath(run);
      await fs.mkdir(logPath, { recursive: true });
      await fs.writeFile(
        join(
          logPath,
          `${timestamp}-${event.callId}-${
            event.functionId ?? event.functionType
          }-${event.eventType}.json`
        ),
        JSON.stringify(event)
      );
    } catch (error) {
      this.logError({
        run,
        message: `Failed to write function event ${event.callId}`,
        error,
      });
    }
  }

  async logError(options: {
    run: FlowRun<unknown>;
    message: string;
    error: unknown;
  }): Promise<void> {
    const timestamp = Date.now();
    try {
      const logPath = this.logPath(options.run);
      return fs.writeFile(
        join(logPath, `${timestamp}-error.json`),
        JSON.stringify({
          timestamp: new Date(timestamp).toISOString(),
          runId: options.run.runId,
          message: options.message,
          error: options.error,
        })
      );
    } catch (error) {
      console.error(`Failed to write error log`);
      console.error(error);
    }
  }
}
