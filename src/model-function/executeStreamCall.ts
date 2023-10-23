import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../core/FunctionEventSource.js";
import { FunctionOptions } from "../core/FunctionOptions.js";
import { getGlobalFunctionLogging } from "../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../core/GlobalFunctionObservers.js";
import { AbortError } from "../core/api/AbortError.js";
import { getFunctionCallLogger } from "../core/getFunctionCallLogger.js";
import { getRun } from "../core/getRun.js";
import { AsyncQueue } from "../event-source/AsyncQueue.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { runSafe } from "../util/runSafe.js";
import { Delta } from "./Delta.js";
import { Model, ModelSettings } from "./Model.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";
import { ModelCallMetadata } from "./ModelCallMetadata.js";

export async function executeStreamCall<
  DELTA_VALUE,
  VALUE,
  MODEL extends Model<ModelSettings>,
>({
  model,
  options,
  input,
  functionType,
  startStream,
  processDelta,
  processFinished,
  getResult,
}: {
  model: MODEL;
  options?: FunctionOptions;
  input: unknown;
  functionType: ModelCallStartedEvent["functionType"];
  startStream: (
    options?: FunctionOptions
  ) => PromiseLike<AsyncIterable<Delta<DELTA_VALUE>>>;
  processDelta: (
    delta: Delta<DELTA_VALUE> & { type: "delta" }
  ) => VALUE | undefined;
  processFinished?: () => VALUE | undefined;
  getResult: () => Record<string, unknown>;
}): Promise<{
  value: AsyncIterable<VALUE>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}> {
  const run = await getRun(options?.run);
  const settings = model.settings;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getGlobalFunctionLogging()),
      ...getGlobalFunctionObservers(),
      ...(settings.observers ?? []),
      ...(run?.functionObserver != null ? [run.functionObserver] : []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    functionType,

    callId: `call-${createId()}`,
    parentCallId: options?.parentCallId,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,

    model: model.modelInformation,
    settings: model.settingsForEvent,
    input,

    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate,
  };

  eventSource.notify({
    eventType: "started",
    ...startMetadata,
  } as ModelCallStartedEvent);

  const result = await runSafe(async () => {
    const deltaIterable = await startStream({
      functionId: options?.functionId,
      logging: options?.logging,
      observers: options?.observers,
      run,
      parentCallId: startMetadata.callId,
    });

    // Return a queue that can be iterated over several times:
    const responseQueue = new AsyncQueue<VALUE>();

    // run async:
    (async function () {
      for await (const event of deltaIterable) {
        if (event?.type === "error") {
          const error = event.error;

          const finishMetadata = {
            eventType: "finished" as const,
            ...startMetadata,
            finishTimestamp: new Date(),
            durationInMs: durationMeasurement.durationInMs,
          };

          eventSource.notify(
            error instanceof AbortError
              ? ({
                  ...finishMetadata,
                  result: { status: "abort" },
                } as ModelCallFinishedEvent)
              : ({
                  ...finishMetadata,
                  result: { status: "error", error },
                } as ModelCallFinishedEvent)
          );

          throw error;
        }

        if (event?.type === "delta") {
          const value = processDelta(event);
          if (value !== undefined) {
            responseQueue.push(value);
          }
        }
      }

      if (processFinished != null) {
        const value = processFinished();

        if (value !== undefined) {
          responseQueue.push(value);
        }
      }

      responseQueue.close();

      const finishMetadata = {
        eventType: "finished" as const,
        ...startMetadata,
        finishTimestamp: new Date(),
        durationInMs: durationMeasurement.durationInMs,
      };

      eventSource.notify({
        ...finishMetadata,
        result: {
          status: "success",
          ...getResult(),
        },
      } as ModelCallFinishedEvent);
    })();

    return responseQueue;
  });

  if (!result.ok) {
    const finishMetadata = {
      eventType: "finished" as const,
      ...startMetadata,
      finishTimestamp: new Date(),
      durationInMs: durationMeasurement.durationInMs,
    };

    if (result.isAborted) {
      eventSource.notify({
        ...finishMetadata,
        eventType: "finished",
        result: {
          status: "abort",
        },
      } as ModelCallFinishedEvent);
      throw new AbortError();
    }

    eventSource.notify({
      ...finishMetadata,
      eventType: "finished",
      result: {
        status: "error",
        error: result.error,
      },
    } as ModelCallFinishedEvent);

    throw result.error;
  }

  return {
    value: result.value,
    metadata: startMetadata,
  };
}
