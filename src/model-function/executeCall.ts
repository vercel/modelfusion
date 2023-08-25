import { nanoid as createId } from "nanoid";
import { RunFunctionEventSource } from "../run/RunFunctionEventSource.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { ModelFunctionOptions } from "./ModelFunctionOptions.js";
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

export function executeCall<
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
  options?: ModelFunctionOptions<SETTINGS>;
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
    options: ModelFunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;
  extractOutputValue: (response: RESPONSE) => OUTPUT;
}): ModelFunctionPromise<MODEL, OUTPUT, RESPONSE> {
  return new ModelFunctionPromise(
    doExecuteCall({
      model,
      options,
      getStartEvent,
      getAbortEvent,
      getFailureEvent,
      getSuccessEvent,
      generateResponse,
      extractOutputValue,
    })
  );
}

export class ModelFunctionPromise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MODEL extends Model<any>,
  OUTPUT,
  RESPONSE,
> extends Promise<OUTPUT> {
  private outputPromise: Promise<OUTPUT>;

  constructor(
    private fullPromise: Promise<{
      output: OUTPUT;
      response: RESPONSE;
      metadata: CallMetadata<MODEL>;
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
    response: RESPONSE;
    metadata: CallMetadata<MODEL>;
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

async function doExecuteCall<
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
  options?: ModelFunctionOptions<SETTINGS>;
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
    options: ModelFunctionOptions<SETTINGS>
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
