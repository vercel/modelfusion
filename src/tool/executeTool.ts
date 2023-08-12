import { nanoid as createId } from "nanoid";
import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { RunFunctionEventSource } from "../run/RunFunctionEventSource.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { Tool } from "./Tool.js";
import { ToolExecutionError } from "./ToolExecutionError.js";

export type ExecuteToolMetadata = {
  callId: string;
  runId?: string;
  sessionId?: string;
  userId?: string;
  functionId?: string;
  startEpochSeconds: number;
  durationInMs: number;
};

/**
 * `executeTool` directly executes a tool with the given parameters.
 */
export async function executeTool<INPUT, OUTPUT>(
  tool: Tool<string, INPUT, OUTPUT>,
  input: INPUT,
  options: FunctionOptions<undefined> & {
    fullResponse: true;
  }
): Promise<{
  output: OUTPUT;
  metadata: ExecuteToolMetadata;
}>;
export async function executeTool<INPUT, OUTPUT>(
  tool: Tool<string, INPUT, OUTPUT>,
  input: INPUT,
  options?: FunctionOptions<undefined> & {
    fullResponse?: false;
  }
): Promise<OUTPUT>;
export async function executeTool<INPUT, OUTPUT>(
  tool: Tool<string, INPUT, OUTPUT>,
  input: INPUT,
  options?: FunctionOptions<undefined> & {
    fullResponse?: boolean;
  }
): Promise<
  | OUTPUT
  | {
      output: OUTPUT;
      metadata: ExecuteToolMetadata;
    }
> {
  const run = options?.run;

  const eventSource = new RunFunctionEventSource({
    observers: run?.observers ?? [],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    callId: `call-${createId()}`,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    startEpochSeconds: durationMeasurement.startEpochSeconds,
  };

  eventSource.notifyRunFunctionStarted({
    type: "execute-tool-started",
    metadata: startMetadata,
    tool: tool as Tool<string, unknown, unknown>,
    input,
  });

  const result = await runSafe(() => tool.execute(input, options));

  const finishMetadata = {
    ...startMetadata,
    durationInMs: durationMeasurement.durationInMs,
  };

  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notifyRunFunctionFinished({
        type: "execute-tool-finished",
        status: "abort",
        metadata: finishMetadata,
        tool: tool as Tool<string, unknown, unknown>,
        input,
      });

      throw new AbortError();
    }

    eventSource.notifyRunFunctionFinished({
      type: "execute-tool-finished",
      status: "failure",
      metadata: finishMetadata,
      tool: tool as Tool<string, unknown, unknown>,
      input,
      error: result.error,
    });

    throw new ToolExecutionError({
      toolName: tool.name,
      input,
      cause: result.error,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (result.error as any)?.message,
    });
  }

  const output = result.output;

  eventSource.notifyRunFunctionFinished({
    type: "execute-tool-finished",
    status: "success",
    metadata: finishMetadata,
    tool: tool as Tool<string, unknown, unknown>,
    input,
    output,
  });

  return options?.fullResponse === true
    ? {
        output,
        metadata: finishMetadata,
      }
    : output;
}
