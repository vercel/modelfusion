import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "./FunctionEventSource.js";
import { FunctionCallOptions, FunctionOptions } from "./FunctionOptions.js";
import { getLogFormat } from "./ModelFusionConfiguration.js";
import { getFunctionObservers } from "./ModelFusionConfiguration.js";
import { AbortError } from "./api/AbortError.js";
import { getFunctionCallLogger } from "./getFunctionCallLogger.js";
import { getRun } from "./getRun.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { runSafe } from "../util/runSafe.js";
import { FunctionEvent } from "./FunctionEvent.js";

export async function executeFunctionCall<VALUE>({
  options,
  input,
  functionType,
  execute,
  inputPropertyName = "input",
  outputPropertyName = "value",
}: {
  options?: FunctionOptions;
  input: unknown;
  functionType: FunctionEvent["functionType"];
  execute: (options: FunctionCallOptions) => PromiseLike<VALUE>;
  inputPropertyName?: string;
  outputPropertyName?: string;
}): Promise<VALUE> {
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

  const startMetadata = {
    functionType,

    callId: `call-${createId()}`,
    parentCallId: options?.callId,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,

    [inputPropertyName]: input,

    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate,
  };

  eventSource.notify({
    eventType: "started",
    ...startMetadata,
  } as FunctionEvent);

  const result = await runSafe(() =>
    execute({
      functionType,
      functionId: options?.functionId,
      callId: startMetadata.callId,
      logging: options?.logging,
      observers: options?.observers,
      run,
    })
  );

  const finishMetadata = {
    eventType: "finished" as const,
    ...startMetadata,
    finishTimestamp: new Date(),
    durationInMs: durationMeasurement.durationInMs,
  };

  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notify({
        ...finishMetadata,
        eventType: "finished",
        result: {
          status: "abort",
        },
      } as FunctionEvent);
      throw new AbortError();
    }

    eventSource.notify({
      ...finishMetadata,
      eventType: "finished",
      result: {
        status: "error",
        error: result.error,
      },
    } as FunctionEvent);

    throw result.error;
  }

  eventSource.notify({
    ...finishMetadata,
    eventType: "finished",
    result: {
      status: "success",
      [outputPropertyName]: result.value,
    },
  } as FunctionEvent);

  return result.value;
}
