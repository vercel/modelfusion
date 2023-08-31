import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../core/FunctionEventSource.js";
import { getGlobalFunctionObservers } from "../core/GlobalFunctionObservers.js";
import { startDurationMeasurement } from "../util/DurationMeasurement.js";
import { AbortError } from "../util/api/AbortError.js";
import { runSafe } from "../util/runSafe.js";
import { Model, ModelSettings } from "./Model.js";
import {
  ModelCallFinishedEvent,
  ModelCallStartedEvent,
} from "./ModelCallEvent.js";
import { ModelFunctionOptions } from "./ModelFunctionOptions.js";
import { ModelInformation } from "./ModelInformation.js";
import { getModelCallLogger } from "./getModelCallLogger.js";

export type ModelCallMetadata = {
  callId: string;
  runId?: string;
  sessionId?: string;
  userId?: string;
  functionId?: string;
  startTimestamp: Date;
  finishTimestamp: Date;
  durationInMs: number;
  model: ModelInformation;
};

export class ModelFunctionPromise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OUTPUT,
  RESPONSE,
> extends Promise<OUTPUT> {
  private outputPromise: Promise<OUTPUT>;

  constructor(
    private fullPromise: Promise<{
      output: OUTPUT;
      response: RESPONSE;
      metadata: ModelCallMetadata;
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
    metadata: ModelCallMetadata;
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

export function executeCall<
  SETTINGS extends ModelSettings,
  MODEL extends Model<SETTINGS>,
  OUTPUT,
  RESPONSE,
>({
  model,
  options,
  input,
  functionType,
  generateResponse,
  extractOutputValue,
  extractUsage,
}: {
  model: MODEL;
  options?: ModelFunctionOptions<SETTINGS>;
  input: unknown;
  functionType: ModelCallStartedEvent["functionType"];
  generateResponse: (
    options: ModelFunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;
  extractOutputValue: (response: RESPONSE) => OUTPUT;
  extractUsage?: (response: RESPONSE) => unknown;
}): ModelFunctionPromise<OUTPUT, RESPONSE> {
  return new ModelFunctionPromise(
    doExecuteCall({
      model,
      options,
      input,
      functionType,
      generateResponse,
      extractOutputValue,
      extractUsage,
    })
  );
}

async function doExecuteCall<
  SETTINGS extends ModelSettings,
  MODEL extends Model<SETTINGS>,
  OUTPUT,
  RESPONSE,
>({
  model,
  options,
  input,
  functionType,
  generateResponse,
  extractOutputValue,
  extractUsage,
}: {
  model: MODEL;
  options?: ModelFunctionOptions<SETTINGS>;
  input: unknown;
  functionType: ModelCallStartedEvent["functionType"];
  generateResponse: (
    options: ModelFunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;
  extractOutputValue: (response: RESPONSE) => OUTPUT;
  extractUsage?: (response: RESPONSE) => unknown;
}): Promise<{
  output: OUTPUT;
  response: RESPONSE;
  metadata: ModelCallMetadata;
}> {
  if (options?.settings != null) {
    model = model.withSettings(options.settings);
    options = {
      functionId: options.functionId,
      logging: options.logging,
      observers: options.observers,
      run: options.run,
    };
  }

  const run = options?.run;
  const settings = model.settings;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getModelCallLogger(options?.logging),
      ...getGlobalFunctionObservers(),
      ...(settings.observers ?? []),
      ...(run?.observers ?? []),
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

  const result = await runSafe(() =>
    generateResponse({
      functionId: options?.functionId,
      settings, // options.setting is null here because of the initial guard
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

  const response = result.output;
  const output = extractOutputValue(response);
  const usage = extractUsage?.(response);

  eventSource.notify({
    ...finishMetadata,
    eventType: "finished",
    result: {
      status: "success",
      usage,
      response,
      output,
    },
  } as ModelCallFinishedEvent);

  return {
    output,
    response,
    metadata: finishMetadata,
  };
}
