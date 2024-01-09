import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../core/FunctionEventSource.js";
import {
  FunctionCallOptions,
  FunctionOptions,
} from "../core/FunctionOptions.js";
import { getLogFormat } from "../core/ModelFusionConfiguration.js";
import { getFunctionObservers } from "../core/ModelFusionConfiguration.js";
import { AbortError } from "../core/api/AbortError.js";
import { getFunctionCallLogger } from "../core/getFunctionCallLogger.js";
import { getRun } from "../core/getRun.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { runSafe } from "../util/runSafe.js";
import { Model, ModelSettings } from "./Model.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";
import { ModelCallMetadata } from "./ModelCallMetadata.js";

export async function executeStandardCall<
  VALUE,
  MODEL extends Model<ModelSettings>,
>({
  model,
  options,
  input,
  functionType,
  generateResponse,
}: {
  model: MODEL;
  options?: FunctionOptions;
  input: unknown;
  functionType: ModelCallStartedEvent["functionType"];
  generateResponse: (options: FunctionCallOptions) => PromiseLike<{
    rawResponse: unknown;
    extractedValue: VALUE;
    usage?: unknown;
  }>;
}): Promise<{
  value: VALUE;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}> {
  const run = await getRun(options?.run);
  const settings = model.settings;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getLogFormat()),
      ...getFunctionObservers(),
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
    parentCallId: options?.callId,
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

  const result = await runSafe(() =>
    generateResponse({
      functionType,
      functionId: options?.functionId,
      callId: startMetadata.callId,
      logging: options?.logging,
      observers: options?.observers,
      cache: options?.cache,
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

  const rawResponse = result.value.rawResponse;
  const value = result.value.extractedValue;
  const usage = result.value.usage;

  eventSource.notify({
    ...finishMetadata,
    eventType: "finished",
    result: {
      status: "success",
      usage,
      rawResponse,
      value,
    },
  } as ModelCallFinishedEvent);

  return {
    value,
    rawResponse,
    metadata: {
      model: model.modelInformation,

      callId: finishMetadata.callId,
      runId: finishMetadata.runId,
      sessionId: finishMetadata.sessionId,
      userId: finishMetadata.userId,
      functionId: finishMetadata.functionId,

      startTimestamp: startMetadata.startTimestamp,
      finishTimestamp: finishMetadata.finishTimestamp,
      durationInMs: finishMetadata.durationInMs,

      usage,
    },
  };
}
