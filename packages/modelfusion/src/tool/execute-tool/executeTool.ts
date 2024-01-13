import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../../core/FunctionEventSource.js";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import {
  getFunctionObservers,
  getLogFormat,
} from "../../core/ModelFusionConfiguration.js";
import { AbortError } from "../../core/api/AbortError.js";
import { getFunctionCallLogger } from "../../core/getFunctionCallLogger.js";
import { getRun } from "../../core/getRun.js";
import { startDurationMeasurement } from "../../util/DurationMeasurement.js";
import { runSafe } from "../../util/runSafe.js";
import { Tool } from "../Tool.js";
import { ToolExecutionError } from "../ToolExecutionError.js";

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

/**
 * `executeTool` executes a tool with the given parameters.
 */
export async function executeTool<TOOL extends Tool<any, any, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  params: {
    tool: TOOL;
    args: TOOL["parameters"]["_type"];
    fullResponse?: false;
  } & FunctionOptions
): Promise<ReturnType<TOOL["execute"]>>;
export async function executeTool<TOOL extends Tool<any, any, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  params: {
    tool: TOOL;
    args: TOOL["parameters"]["_type"];
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  output: Awaited<ReturnType<TOOL["execute"]>>;
  metadata: ExecuteToolMetadata;
}>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeTool<TOOL extends Tool<any, any, any>>({
  tool,
  args,
  fullResponse,
  ...options
}: {
  tool: TOOL;
  args: TOOL["parameters"]["_type"];
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  | ReturnType<TOOL["execute"]>
  | {
      output: Awaited<ReturnType<TOOL["execute"]>>;
      metadata: ExecuteToolMetadata;
    }
> {
  const callResponse = await doExecuteTool({ tool, args, ...options });
  return fullResponse ? callResponse : callResponse.output;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function doExecuteTool<TOOL extends Tool<any, any, any>>({
  tool,
  args,
  ...options
}: {
  tool: TOOL;
  args: TOOL["parameters"]["_type"];
} & FunctionOptions): Promise<{
  output: Awaited<ReturnType<TOOL["execute"]>>;
  metadata: ExecuteToolMetadata;
}> {
  const run = await getRun(options?.run);

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getLogFormat()),
      ...getFunctionObservers(),
      ...(run?.functionObserver != null ? [run.functionObserver] : []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const metadata = {
    functionType: "execute-tool" as const,

    callId: `call-${createId()}`,
    parentCallId: options?.callId,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,

    toolName: tool.name,
    input: args,
  };

  eventSource.notify({
    ...metadata,
    eventType: "started",
    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate,
  });

  const result = await runSafe(() =>
    tool.execute(args, {
      functionType: metadata.functionType,
      callId: metadata.callId,
      functionId: options?.functionId,
      logging: options?.logging,
      observers: options?.observers,
      run,
    })
  );

  const finishMetadata = {
    ...metadata,
    eventType: "finished" as const,
    timestamp: new Date(),
    startTimestamp: durationMeasurement.startDate,
    finishTimestamp: new Date(),
    durationInMs: durationMeasurement.durationInMs,
  };

  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notify({
        ...finishMetadata,
        result: {
          status: "abort",
        },
      });

      throw new AbortError();
    }

    eventSource.notify({
      ...finishMetadata,
      result: {
        status: "error",
        error: result.error,
      },
    });

    throw new ToolExecutionError({
      toolName: tool.name,
      input: args,
      cause: result.error,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (result.error as any)?.message,
    });
  }

  const output = result.value;

  eventSource.notify({
    ...finishMetadata,
    result: {
      status: "success",
      value: output,
    },
  });

  return {
    output,
    metadata: finishMetadata,
  };
}
