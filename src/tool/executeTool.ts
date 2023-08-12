import { nanoid as createId } from "nanoid";
import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { RunFunctionEventSource } from "../run/RunFunctionEventSource.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { Tool } from "./Tool.js";

export async function executeTool<
  INPUT,
  OUTPUT,
  TOOL extends Tool<string, INPUT, OUTPUT>,
>(
  tool: TOOL,
  input: INPUT,
  options?: FunctionOptions<undefined>
): Promise<OUTPUT> {
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

    // TODO special ToolExecutionError
    throw result.error;
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

  return output;
}
