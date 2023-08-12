import { nanoid as createId } from "nanoid";
import { RunFunctionEventSource } from "../run/RunFunctionEventSource.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { FunctionOptions } from "./FunctionOptions.js";
import { Model, ModelSettings } from "./Model.js";
import {
  ModelCallFinishedEvent,
  ModelCallFinishedEventMetadata,
  ModelCallStartedEvent,
  ModelCallStartedEventMetadata,
} from "./ModelCallEvent.js";

export type CallMetadata<MODEL extends Model<unknown>> = {
  callId: string;
  runId?: string;
  sessionId?: string;
  userId?: string;
  functionId?: string;
  model: MODEL["modelInformation"];
  startEpochSeconds: number;
  durationInMs: number;
};

export async function executeCall<
  SETTINGS extends ModelSettings,
  MODEL extends Model<SETTINGS>,
  OUTPUT,
  RESPONSE,
>({
  model,
  options,
  getStartEvent,
  getAbortEvent,
  getFailureEvent,
  getSuccessEvent,
  generateResponse,
  extractOutputValue,
}: {
  model: MODEL;
  options?: FunctionOptions<SETTINGS>;
  getStartEvent: (
    metadata: ModelCallStartedEventMetadata,
    settings: SETTINGS
  ) => ModelCallStartedEvent;
  getAbortEvent: (
    metadata: ModelCallFinishedEventMetadata,
    settings: SETTINGS
  ) => ModelCallFinishedEvent;
  getFailureEvent: (
    metadata: ModelCallFinishedEventMetadata,
    settings: SETTINGS,
    error: unknown
  ) => ModelCallFinishedEvent;
  getSuccessEvent: (
    metadata: ModelCallFinishedEventMetadata,
    settings: SETTINGS,
    response: RESPONSE,
    output: OUTPUT
  ) => ModelCallFinishedEvent;
  generateResponse: (
    options: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;
  extractOutputValue: (response: RESPONSE) => OUTPUT;
}): Promise<{
  output: OUTPUT;
  response: RESPONSE;
  metadata: CallMetadata<MODEL>;
}> {
  if (options?.settings != null) {
    model = model.withSettings(options.settings);
    options = {
      functionId: options.functionId,
      run: options.run,
    };
  }

  const run = options?.run;
  const settings = model.settings;

  const eventSource = new RunFunctionEventSource({
    observers: [...(settings.observers ?? []), ...(run?.observers ?? [])],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    callId: `call-${createId()}`,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    model: model.modelInformation,
    startEpochSeconds: durationMeasurement.startEpochSeconds,
  };

  eventSource.notifyRunFunctionStarted(getStartEvent(startMetadata, settings));

  const result = await runSafe(() =>
    generateResponse({
      functionId: options?.functionId,
      settings, // options.setting is null here because of the initial guard
      run,
    })
  );

  const finishMetadata = {
    ...startMetadata,
    durationInMs: durationMeasurement.durationInMs,
  };

  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notifyRunFunctionFinished(
        getAbortEvent(finishMetadata, settings)
      );
      throw new AbortError();
    }

    eventSource.notifyRunFunctionFinished(
      getFailureEvent(finishMetadata, settings, result.error)
    );
    throw result.error;
  }

  const response = result.output;
  const output = extractOutputValue(response);

  eventSource.notifyRunFunctionFinished(
    getSuccessEvent(finishMetadata, settings, response, output)
  );

  return {
    output,
    response,
    metadata: finishMetadata,
  };
}
