import { nanoid as createId } from "nanoid";
import { ErrorHandler } from "../util/ErrorHandler.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { FunctionOptions } from "./FunctionOptions.js";
import { Model, ModelSettings } from "./Model.js";
import { ModelCallEventSource } from "./ModelCallEventSource.js";
import {
  ModelCallFinishedEvent,
  ModelCallFinishedEventMetadata,
  ModelCallStartedEvent,
  ModelCallStartedEventMetadata,
} from "./ModelCallObserver.js";

export async function executeCall<
  SETTINGS extends ModelSettings,
  MODEL extends Model<SETTINGS>,
  OUTPUT,
  RESPONSE
>({
  model,
  options,
  callModel,
  getStartEvent,
  getAbortEvent,
  getFailureEvent,
  getSuccessEvent,
  errorHandler,
  generateResponse,
  extractOutputValue,
}: {
  model: MODEL;
  options?: FunctionOptions<SETTINGS>;
  callModel: (
    model: MODEL,
    options: FunctionOptions<SETTINGS>
  ) => PromiseLike<OUTPUT>;
  getStartEvent: (
    metadata: ModelCallStartedEventMetadata
  ) => ModelCallStartedEvent;
  getAbortEvent: (
    metadata: ModelCallFinishedEventMetadata
  ) => ModelCallFinishedEvent;
  getFailureEvent: (
    metadata: ModelCallFinishedEventMetadata,
    error: unknown
  ) => ModelCallFinishedEvent;
  getSuccessEvent: (
    metadata: ModelCallFinishedEventMetadata,
    output: OUTPUT
  ) => ModelCallFinishedEvent;
  errorHandler: ErrorHandler;
  generateResponse: (
    options: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;
  extractOutputValue: (response: RESPONSE) => OUTPUT;
}): Promise<OUTPUT> {
  if (options?.settings != null) {
    return callModel(model.withSettings(options.settings), {
      functionId: options.functionId,
      run: options.run,
    });
  }

  const run = options?.run;

  const eventSource = new ModelCallEventSource({
    observers: [...(model.settings.observers ?? []), ...(run?.observers ?? [])],
    errorHandler,
  });

  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  const callId = createId();

  const startMetadata = {
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    callId,
    model: model.modelInformation,
    startEpochSeconds,
  };

  eventSource.notifyModelCallStarted(getStartEvent(startMetadata));

  const result = await runSafe(() =>
    generateResponse({
      functionId: options?.functionId,
      settings: model.settings, // options.setting is null here because of the initial guard
      run,
    })
  );

  const generationDurationInMs = Math.ceil(performance.now() - startTime);

  const finishMetadata = {
    ...startMetadata,
    durationInMs: generationDurationInMs,
  };

  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notifyModelCallFinished(getAbortEvent(finishMetadata));
      throw new AbortError();
    }

    eventSource.notifyModelCallFinished(
      getFailureEvent(finishMetadata, result.error)
    );
    throw result.error;
  }

  const output = extractOutputValue(result.output);
  eventSource.notifyModelCallFinished(getSuccessEvent(finishMetadata, output));
  return output;
}
