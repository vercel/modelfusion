import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../core/FunctionEventSource.js";
import { FunctionOptions } from "../core/FunctionOptions.js";
import { getGlobalFunctionLogging } from "../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../core/GlobalFunctionObservers.js";
import { AbortError } from "../core/api/AbortError.js";
import { getFunctionCallLogger } from "../core/getFunctionCallLogger.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { runSafe } from "../util/runSafe.js";
import { Model, ModelSettings } from "./Model.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";
import { ModelCallMetadata } from "./ModelCallMetadata.js";

export class ModelFunctionPromise<VALUE> extends Promise<VALUE> {
  private valuePromise: Promise<VALUE>;

  constructor(
    private fullPromise: Promise<{
      value: VALUE;
      response: unknown;
      metadata: ModelCallMetadata;
    }>
  ) {
    super((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(null as any); // we override the resolve function
    });

    this.valuePromise = fullPromise.then((result) => result.value);
  }

  // TODO rename to returnEverything() or returnAll()?
  asFullResponse(): Promise<{
    value: VALUE;
    response: unknown;
    metadata: ModelCallMetadata;
  }> {
    return this.fullPromise;
  }

  override then<TResult1 = VALUE, TResult2 = never>(
    onfulfilled?:
      | ((value: VALUE) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.valuePromise.then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<VALUE | TResult> {
    return this.valuePromise.catch(onrejected);
  }

  override finally(
    onfinally?: (() => void) | undefined | null
  ): Promise<VALUE> {
    return this.valuePromise.finally(onfinally);
  }
}

export function executeCall<VALUE, MODEL extends Model<ModelSettings>>({
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
  generateResponse: (options?: FunctionOptions) => PromiseLike<{
    response: unknown;
    extractedValue: VALUE;
    usage?: unknown;
  }>;
}): ModelFunctionPromise<VALUE> {
  return new ModelFunctionPromise(
    doExecuteCall({
      model,
      options,
      input,
      functionType,
      generateResponse,
    })
  );
}

async function doExecuteCall<VALUE, MODEL extends Model<ModelSettings>>({
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
  generateResponse: (options?: FunctionOptions) => PromiseLike<{
    response: unknown;
    extractedValue: VALUE;
    usage?: unknown;
  }>;
}): Promise<{
  value: VALUE;
  response: unknown;
  metadata: ModelCallMetadata;
}> {
  const run = options?.run;
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

  const result = await runSafe(() => generateResponse(options));

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

  const response = result.value.response;
  const value = result.value.extractedValue;
  const usage = result.value.usage;

  eventSource.notify({
    ...finishMetadata,
    eventType: "finished",
    result: {
      status: "success",
      usage,
      response,
      value,
    },
  } as ModelCallFinishedEvent);

  return {
    value,
    response,
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
