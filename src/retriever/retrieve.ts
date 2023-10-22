import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../core/FunctionEventSource.js";
import { FunctionOptions } from "../core/FunctionOptions.js";
import { getGlobalFunctionLogging } from "../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../core/GlobalFunctionObservers.js";
import { AbortError } from "../core/api/AbortError.js";
import { getFunctionCallLogger } from "../core/getFunctionCallLogger.js";
import { getRun } from "../core/getRun.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { runSafe } from "../util/runSafe.js";
import {
  RetrieveFinishedEvent,
  RetrieveStartedEvent,
} from "./RetrieveEvent.js";
import { Retriever } from "./Retriever.js";

export async function retrieve<OBJECT, QUERY>(
  retriever: Retriever<OBJECT, QUERY>,
  query: QUERY,
  options?: FunctionOptions
): Promise<OBJECT[]> {
  const run = await getRun(options?.run);

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getGlobalFunctionLogging()),
      ...getGlobalFunctionObservers(),
      ...(run?.functionObserver != null ? [run.functionObserver] : []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    functionType: "retrieve",

    callId: `call-${createId()}`,
    parentCallId: options?.parentCallId,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,

    query,

    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate,
  };

  eventSource.notify({
    eventType: "started",
    ...startMetadata,
  } as RetrieveStartedEvent);

  const result = await runSafe(() =>
    retriever.retrieve(query, {
      functionId: options?.functionId,
      logging: options?.logging,
      observers: options?.observers,
      run,
      parentCallId: startMetadata.callId,
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
      } as RetrieveFinishedEvent);
      throw new AbortError();
    }

    eventSource.notify({
      ...finishMetadata,
      eventType: "finished",
      result: {
        status: "error",
        error: result.error,
      },
    } as RetrieveFinishedEvent);

    throw result.error;
  }

  eventSource.notify({
    ...finishMetadata,
    eventType: "finished",
    result: {
      status: "success",
      value: result.value,
    },
  } as RetrieveFinishedEvent);

  return result.value;
}
