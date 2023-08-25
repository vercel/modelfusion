import { nanoid as createId } from "nanoid";
import { z } from "zod";
import { FunctionEventSource } from "../run/FunctionEventSource.js";
import { FunctionOptions } from "../run/FunctionOptions.js";
import { getGlobalFunctionObservers } from "../run/GlobalFunctionObservers.js";
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
  startTimestamp: Date;
  finishTimestamp: Date;
  durationInMs: number;
};

export class ExecuteToolPromise<OUTPUT> extends Promise<OUTPUT> {
  private outputPromise: Promise<OUTPUT>;

  constructor(
    private fullPromise: Promise<{
      output: OUTPUT;
      metadata: ExecuteToolMetadata;
    }>
  ) {
    super((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(null as any); // we override the resolve function
    });

    this.outputPromise = fullPromise.then((result) => result.output);
  }

  asFullResponse(): Promise<{
    output: OUTPUT;
    metadata: ExecuteToolMetadata;
  }> {
    return this.fullPromise;
  }

  override then<TResult1 = OUTPUT, TResult2 = never>(
    onfulfilled?:
      | ((value: OUTPUT) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.outputPromise.then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<OUTPUT | TResult> {
    return this.outputPromise.catch(onrejected);
  }

  override finally(
    onfinally?: (() => void) | undefined | null
  ): Promise<OUTPUT> {
    return this.outputPromise.finally(onfinally);
  }
}

/**
 * `executeTool` directly executes a tool with the given parameters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeTool<TOOL extends Tool<any, any, any>>(
  tool: TOOL,
  input: z.infer<TOOL["inputSchema"]>,
  options?: FunctionOptions
): ExecuteToolPromise<ReturnType<TOOL["execute"]>> {
  return new ExecuteToolPromise(doExecuteTool(tool, input, options));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function doExecuteTool<TOOL extends Tool<any, any, any>>(
  tool: TOOL,
  input: z.infer<TOOL["inputSchema"]>,
  options?: FunctionOptions
): Promise<{
  output: Awaited<ReturnType<TOOL["execute"]>>;
  metadata: ExecuteToolMetadata;
}> {
  const run = options?.run;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getGlobalFunctionObservers(),
      ...(run?.observers ?? []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    callId: `call-${createId()}`,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    startTimestamp: durationMeasurement.startDate,
  };

  eventSource.notifyFunctionStarted({
    type: "execute-tool-started",
    metadata: startMetadata,
    tool: tool as Tool<string, unknown, unknown>,
    input,
  });

  const result = await runSafe(() => tool.execute(input, options));

  const finishMetadata = {
    ...startMetadata,
    finishTimestamp: new Date(),
    durationInMs: durationMeasurement.durationInMs,
  };

  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notifyFunctionFinished({
        type: "execute-tool-finished",
        status: "abort",
        metadata: finishMetadata,
        tool: tool as Tool<string, unknown, unknown>,
        input,
      });

      throw new AbortError();
    }

    eventSource.notifyFunctionFinished({
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

  eventSource.notifyFunctionFinished({
    type: "execute-tool-finished",
    status: "success",
    metadata: finishMetadata,
    tool: tool as Tool<string, unknown, unknown>,
    input,
    output,
  });

  return {
    output,
    metadata: finishMetadata,
  };
}
